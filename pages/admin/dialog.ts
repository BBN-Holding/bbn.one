import * as zod from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { ZodError } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { API } from "shared/mod.ts";
import { Box, Button, ButtonStyle, CenterV, Checkbox, Custom, Empty, Horizontal, Image, Label, SheetDialog, Spacer, Validate, Vertical, asState, createElement, getErrorMessage } from "webgen/mod.ts";
import reviewTexts from "../../data/reviewTexts.json" with { type: "json" };
import { Drop, ReviewResponse } from "../../spec/music.ts";
import { sheetStack } from "../_legacy/helper.ts";
import { clientRender, dropPatternMatching, rawTemplate, render } from "./email.ts";

function css(data: TemplateStringsArray, ...expr: string[]) {
    const merge = data.map((x, i) => x + (expr[ i ] || ''));

    const style = new CSSStyleSheet();
    style.replaceSync(merge.join(""));
    return style;
}

document.adoptedStyleSheets.push(css`
    .footer {
        gap: 0.5rem;
    }
    .test .wimage{
        height: 40rem;
        width: 100%;
        background-color: transparent;
    }
    .test .wimage .loading-wheel {
        z-index: 0;
    }
    .dialog-me {
        min-height: 40rem;
    }

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
    "Malicious Activity"
];

const rejectReasons = [ ReviewResponse.DeclineCopyright ];
export const dialogState = asState({
    drop: <Drop | undefined>undefined,
    responseText: "",
    validationState: <ZodError | undefined>undefined,
});
export const ApproveDialog = SheetDialog(sheetStack, "Approve Drop",
    dialogState.$drop.map(drop =>
        Box(
            drop ? Vertical(
                Box(
                    Label("Email Response"),
                    Custom((() => {
                        const ele = createElement("textarea");
                        ele.rows = 10;
                        dialogState.responseText = reviewTexts.APPROVED.content.join("\n");
                        ele.value = dialogState.responseText;
                        ele.style.resize = "vertical";
                        ele.oninput = () => {
                            dialogState.responseText = ele.value;
                        };
                        return ele;
                    })()),
                )
                    .addClass("winput", "grayscaled", "has-value", "textarea")
                    .setMargin("0 0 .5rem"),
                Label("Preview")
                    .setMargin("0 0 0.5rem"),
                dialogState.$responseText
                    .map(() => clientRender(dropPatternMatching(dialogState.responseText, drop)))
                    .asRefComponent(),
                Horizontal(
                    Box(dialogState.$validationState.map(error => error ? CenterV(
                        Label(getErrorMessage(error))
                            .addClass("error-message")
                            .setMargin("0 0.5rem 0 0")
                    )
                        : Empty()).asRefComponent()),
                    Spacer(),
                    Button("Cancel").setStyle(ButtonStyle.Secondary).onClick(() => ApproveDialog.close()),
                    Button("Submit").onClick(async () => {
                        const { data, error, validate } = Validate(
                            dialogState,
                            zod.object({
                                responseText: zod.string().refine(x => render(dropPatternMatching(x, drop)).errors.length == 0, { message: "Invalid MJML" })
                            })
                        );

                        validate();
                        if (error.getValue()) return data.validationState = error.getValue();

                        await API.music.id(drop._id).review.post({
                            title: dropPatternMatching(reviewTexts.APPROVED.header, drop),
                            reason: [ "APPROVED" ],
                            body: rawTemplate(dropPatternMatching(dialogState.responseText, drop)),
                            denyEdits: false
                        });

                        ApproveDialog.close();
                    })
                ).setGap()
            ) : Box(Image({ type: "loading" }, "Loading...")).addClass("test")
        )
            .setMargin("0 0 var(--gap)")
    ).asRefComponent()
);

const rejectState = asState({
    page: 0,
    respones: [] as ReviewResponse[],
    denyEdits: false,
    responseText: "",
});
export const DeclineDialog = SheetDialog(sheetStack, "Decline Drop",
    rejectState.$page.map(page => {
        if (page == 0)
            return Vertical(
                Label("Choose Rejection Reasons"),
                ...rejectReasons
                    .map((rsp) =>
                        Horizontal(
                            Checkbox(rejectState.respones.includes(rsp)).onClick(() => rejectState.respones.includes(rsp) ? rejectState.respones.splice(rejectState.respones.indexOf(rsp), 1) : rejectState.respones.push(rsp)),
                            Label(reviewResponse[ rejectReasons.indexOf(rsp) ]),
                            Spacer()
                        )
                            .setMargin("0.5rem 0")
                            .setGap("0.5rem")
                            .setAlign("center")
                    ),

                Label("Choose Rejection Method"),
                Horizontal(
                    Checkbox(rejectState.denyEdits).onClick(() => rejectState.denyEdits = !rejectState.denyEdits),
                    Label("Reject (Deny Edits)"),
                    Spacer()
                )
                    .setMargin("0.5rem 0")
                    .setGap("0.5rem")
                    .setAlign("center"),
                Horizontal(
                    Box(dialogState.$validationState.map(error => error ? CenterV(
                        Label(getErrorMessage(error))
                            .addClass("error-message")
                            .setMargin("0 0.5rem 0 0")
                    )
                        : Empty()).asRefComponent()),
                    Spacer(),
                    Button("Cancel").setStyle(ButtonStyle.Secondary).onClick(() => DeclineDialog.close()),
                    Button("Next").onClick(async () => {
                        const { error, validate } = Validate(
                            rejectState,
                            zod.object({
                                respones: zod.string().array().min(1),
                                denyEdits: zod.boolean()
                            })
                        );

                        validate();
                        if (error.getValue()) return dialogState.validationState = error.getValue();

                        rejectState.responseText = reviewTexts.REJECTED.content.join("\n")
                            .replace("{{REASON}}", (rejectState.respones as Array<keyof typeof reviewTexts.REJECTED.reasonMap>)
                                .map(x => reviewTexts.REJECTED.reasonMap[ x ])
                                .filter(x => x)
                                .join(""));

                        rejectState.page++;
                    })
                ).setGap()
            );
        else if (page == 1)
            return Vertical(
                Box(
                    Label("Email Response"),
                    Custom((() => {
                        const ele = createElement("textarea");
                        ele.rows = 10;
                        ele.value = rejectState.responseText;
                        ele.style.resize = "vertical";
                        ele.oninput = () => {
                            rejectState.responseText = ele.value;
                        };
                        return ele;
                    })()),
                )
                    .addClass("winput", "grayscaled", "has-value", "textarea")
                    .setMargin("0 0 .5rem"),
                Label("Preview")
                    .setMargin("0 0 0.5rem"),
                rejectState.$responseText
                    .map(() => clientRender(dropPatternMatching(rejectState.responseText, dialogState.drop!)))
                    .asRefComponent(),
                Horizontal(
                    Box(dialogState.$validationState.map(error => error ? CenterV(
                        Label(getErrorMessage(error))
                            .addClass("error-message")
                            .setMargin("0 0.5rem 0 0")
                    )
                        : Empty()).asRefComponent()),
                    Spacer(),
                    Button("Cancel").setStyle(ButtonStyle.Secondary).onClick(() => DeclineDialog.close()),
                    Button("Submit").onClick(async () => {
                        const { error, validate } = Validate(
                            rejectState,
                            zod.object({
                                responseText: zod.string().refine(x => render(dropPatternMatching(x, dialogState.drop!)).errors.length == 0, { message: "Invalid MJML" })
                            })
                        );

                        validate();
                        if (error.getValue()) return dialogState.validationState = error.getValue();

                        const reason = <ReviewResponse[]>rejectState.respones;

                        await API.music.id(dialogState.drop!._id).review.post({
                            title: dropPatternMatching(reviewTexts.REJECTED.header, dialogState.drop!),
                            reason,
                            body: rawTemplate(dropPatternMatching(rejectState.responseText, dialogState.drop!)),
                            denyEdits: rejectState.denyEdits
                        });

                        DeclineDialog.close();
                    })
                ).setGap()
            );
        return Box();
    }).asRefComponent()
);