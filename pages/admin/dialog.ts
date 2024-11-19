import { API } from "shared/mod.ts";
import { asRefRecord, Box, Checkbox, css, Empty, Grid, Label, PrimaryButton, SecondaryButton, SheetHeader, Spinner, TextAreaInput } from "webgen/mod.ts";
import z from "zod/index.ts";
import reviewTexts from "../../data/reviewTexts.json" with { type: "json" };
import { Drop, ReviewResponse } from "../../spec/music.ts";
import { sheetStack } from "../shared/helper.ts";
import { clientRender, dropPatternMatching, rawTemplate, render } from "./email.ts";

document.adoptedStyleSheets.push(css`
    .winput.textarea {
        height: unset;
    }

    .winput.textarea textarea {
        box-sizing: border-box;
        background: none;
        border: none;
        color: var(--font-color);
        font-family: var(--font);
        padding: 0.2rem 0.7rem;
    }

    .winput.textarea textarea:focus {
        outline: none;
    }
`);

const reviewResponse = [
    "Copyright bad",
    "Malicious Activity",
];

const rejectReasons = [ReviewResponse.DeclineCopyright];
export const dialogState = asRefRecord({
    drop: <Drop | undefined> undefined,
    responseText: reviewTexts.APPROVED.content.join("\n"),
    validationState: <z.ZodError | undefined> undefined,
});
export const ApproveDialog = Grid(
    SheetHeader("Approve Drop", sheetStack),
    Box(dialogState.drop.map((drop) =>
        Box(
            drop
                ? Grid(
                    Box(
                        Label("Email Response"),
                        TextAreaInput(dialogState.responseText),
                    )
                        .addClass("winput", "grayscaled", "has-value", "textarea")
                        .setMargin("0 0 .5rem"),
                    Label("Preview")
                        .setMargin("0 0 0.5rem"),
                    Box(dialogState.responseText.map(() => clientRender(dropPatternMatching(dialogState.responseText, drop)))),
                    Grid(
                        Box(
                            dialogState.validationState.map((error) =>
                                error
                                    ? CenterV(
                                        Label(getErrorMessage(error))
                                            .addClass("error-message")
                                            .setMargin("0 0.5rem 0 0"),
                                    )
                                    : Empty()
                            ),
                        ),
                        SecondaryButton("Cancel").onClick(() => sheetStack.removeOne()),
                        PrimaryButton("Submit").onPromiseClick(async () => {
                            const { data, error, validate } = Validate(
                                dialogState,
                                zod.object({
                                    responseText: zod.string().refine((x) => render(dropPatternMatching(x, drop)).errors.length == 0, { message: "Invalid MJML" }),
                                }),
                            );

                            validate();
                            if (error.getValue()) {
                                data.validationState = error.getValue();
                                return;
                            }

                            await API.music.id(drop._id).review.post({
                                title: dropPatternMatching(reviewTexts.APPROVED.header, drop),
                                reason: ["APPROVED"],
                                body: rawTemplate(dropPatternMatching(dialogState.responseText, drop)),
                                denyEdits: false,
                            });

                            sheetStack.removeOne();
                        }),
                    ).setGap(),
                )
                : Spinner(),
        )
            .setMargin("0 0 var(--gap)")
    )),
);

const rejectState = asRefRecord({
    page: 0,
    respones: [] as ReviewResponse[],
    denyEdits: false,
    responseText: "",
});
export const DeclineDialog = Grid(
    SheetHeader("Decline Drop", sheetStack),
    Box(rejectState.page.map((page) => {
        if (page == 0) {
            return Grid(
                Label("Choose Rejection Reasons"),
                ...rejectReasons
                    .map((rsp) =>
                        Grid(
                            Checkbox(rejectState.respones.includes(rsp)).onClick(() => rejectState.respones.includes(rsp) ? rejectState.respones.splice(rejectState.respones.indexOf(rsp), 1) : rejectState.respones.push(rsp)),
                            Label(reviewResponse[rejectReasons.indexOf(rsp)]),
                        )
                            .setGap("0.5rem")
                            .setMargin("0.5rem 0")
                            .setAlignItems("center")
                    ),
                Label("Choose Rejection Method"),
                Grid(
                    Checkbox(rejectState.denyEdits).onClick(() => rejectState.denyEdits = !rejectState.denyEdits),
                    Label("Reject (Deny Edits)"),
                )
                    .setGap("0.5rem")
                    .setMargin("0.5rem 0")
                    .setAlignItems("center"),
                Grid(
                    Box(
                        dialogState.validationState.map((error) =>
                            error
                                ? CenterV(
                                    Label(getErrorMessage(error))
                                        .addClass("error-message")
                                        .setMargin("0 0.5rem 0 0"),
                                )
                                : Empty()
                        ),
                    ),
                    SecondaryButton("Cancel").onClick(() => sheetStack.removeOne()),
                    PrimaryButton("Next").onClick(() => {
                        const { error, validate } = Validate(
                            rejectState,
                            z.object({
                                respones: z.string().array().min(1),
                                denyEdits: z.boolean(),
                            }),
                        );

                        validate();
                        if (error.getValue()) return dialogState.validationState = error.getValue();

                        rejectState.responseText = reviewTexts.REJECTED.content.join("\n")
                            .replace(
                                "{{REASON}}",
                                (rejectState.respones as Array<keyof typeof reviewTexts.REJECTED.reasonMap>)
                                    .map((x) => reviewTexts.REJECTED.reasonMap[x])
                                    .filter((x) => x)
                                    .join(""),
                            );

                        rejectState.page++;
                    }),
                ).setGap(),
            );
        } else if (page == 1) {
            return Grid(
                Box(
                    Label("Email Response"),
                    TextAreaInput(rejectState.responseText),
                )
                    .addClass("winput", "grayscaled", "has-value", "textarea")
                    .setMargin("0 0 .5rem"),
                Label("Preview")
                    .setMargin("0 0 0.5rem"),
                Box(rejectState.responseText.map((x) => clientRender(dropPatternMatching(x, dialogState.drop!)))),
                Grid(
                    Box(
                        dialogState.validationState.map((error) =>
                            error
                                ? Grid(
                                    Label(getErrorMessage(error))
                                        .addClass("error-message")
                                        .setMargin("0 0.5rem 0 0"),
                                )
                                : Empty()
                        ),
                    ),
                    SecondaryButton("Cancel").onClick(() => sheetStack.removeOne()),
                    PrimaryButton("Submit").onPromiseClick(async () => {
                        const { error, validate } = Validate(
                            rejectState,
                            z.object({
                                responseText: z.string().refine((x) => render(dropPatternMatching(x, dialogState.drop!)).errors.length == 0, { message: "Invalid MJML" }),
                            }),
                        );

                        validate();
                        if (error.getValue()) {
                            dialogState.validationState = error.getValue();
                            return;
                        }

                        const reason = <ReviewResponse[]> rejectState.respones;

                        await API.music.id(dialogState.drop!._id).review.post({
                            title: dropPatternMatching(reviewTexts.REJECTED.header, dialogState.drop!),
                            reason,
                            body: rawTemplate(dropPatternMatching(rejectState.responseText, dialogState.drop!)),
                            denyEdits: rejectState.denyEdits,
                        });

                        DeclineDialog.close();
                    }),
                ).setGap(),
            );
        }
        return Empty();
    })),
);
