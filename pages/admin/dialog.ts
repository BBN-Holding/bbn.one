import { Dialog, DropDownInput, Page, Vertical, Wizard, Image, Box, Horizontal, Spacer, PlainText, Custom, createElement, Checkbox, Reactive, Button } from "webgen/mod.ts";
import { Drop, ReviewResponse } from "../../spec/music.ts";
import { saveBlob, showPreviewImage } from "../manager/helper.ts";
import reviewTexts from "../../data/reviewTexts.json" assert { type: "json" };
import { API } from "../manager/RESTSpec.ts";
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
const reviewActions = [
    "APPROVED",
    "DECLINE"
];

const reviewActionsText = [
    "Approved",
    "Decline/Reject"
];

const reviewResponse = [
    "Copyright bad",
    "Malicious Activity"
];

const rejectReasons = [ ReviewResponse.DeclineCopyright ];
export const ReviewDialog = Dialog<{ drop: Drop; }>(({ state }) =>
    Box(
        !state.drop
            ? Box(Image({ type: "loading" }, "Loading...")).addClass("test")
            : Wizard({
                buttonAlignment: "bottom",
                buttonArrangement: 'flex-end',
                cancelAction: () => {
                    ReviewDialog.close();
                },
                submitAction: async ([ { data: { data: { review } } }, { data: { data: { respones, denyEdits } } }, { data: { data: { responseText } } } ]) => {
                    const reason = <ReviewResponse[]>respones;

                    await API.music(API.getToken()).id(state.drop!._id).review.post({
                        title: dropPatternMatching(reviewTexts[ review == "DECLINE" ? "REJECTED" : "APPROVED" ].header, state.drop!),
                        reason: reason,
                        body: rawTemplate(dropPatternMatching(responseText, state.drop!)),
                        denyEdits
                    });

                    ReviewDialog.close();
                },
                // deno-lint-ignore require-await
                onNextPage: async ({ PageData, PageID, Next }) => {
                    const data = PageData();
                    const current = PageID();
                    const reviewPick = data[ 0 ].review;
                    if (current == 0) {
                        if (reviewPick == "APPROVED") {
                            data[ 1 ].respones = [ ReviewResponse.Approved ];
                            data[ 2 ].responseText = reviewTexts.APPROVED.content.join("\n");
                            setTimeout(() => Next());
                        }
                    } else if (current == 1) {
                        if (reviewPick == "APPROVED") return;
                        data[ 2 ].responseText = reviewTexts.REJECTED.content.join("\n")
                            .replace("{{REASON}}", (data[ 1 ].respones as Array<keyof typeof reviewTexts.REJECTED.reasonMap>)
                                .map(x => reviewTexts.REJECTED.reasonMap[ x ])
                                .filter(x => x)
                                .join(""));
                    }

                }
            }, () => [
                Page({
                    review: undefined as string | undefined
                }, (data) => [
                    Vertical(
                        Horizontal(
                            showPreviewImage(state.drop!, true).setWidth("25%"),
                            Spacer()
                        ),
                        Vertical(
                            PlainText(state.drop!.title)
                                .setFont(1.4, 900),

                            PlainText("by " + state.drop!.user)
                                .setFont(0.8),
                        ),
                        // TODO: Replace with a PickerInput (when api is available)
                        DropDownInput("Review", reviewActions)
                            .setRender((data) => reviewActionsText[ reviewActions.indexOf(data) ])
                            .sync(data, "review")
                    )
                        .setGap("1rem")
                        .setMargin("0 0 1rem")
                ]).setValidator((val) => val.object({
                    review: val.any().refine(x => reviewActions.includes(x), "Missing Review Feedback.")
                })),
                Page({
                    respones: [] as ReviewResponse[],
                    denyEdits: false
                }, (data) => [
                    Box(
                        PlainText("Choose Rejection Reasons"),
                        ...rejectReasons
                            .map((rsp) =>
                                Horizontal(
                                    Checkbox(data.respones.includes(rsp)).onClick(() => !data.respones.includes(rsp) ? data.respones.push(rsp) : data.respones.splice(data.respones.indexOf(rsp), 1)),
                                    PlainText(reviewResponse[ rejectReasons.indexOf(rsp) ]),
                                    Spacer()
                                )
                                    .setMargin("0.5rem 0")
                                    .setGap("0.5rem")
                                    .setAlign("center")
                            ),

                        PlainText("Choose Rejection Method"),
                        Horizontal(
                            Checkbox(data.denyEdits).onClick(() => data.denyEdits = !data.denyEdits),
                            PlainText("Reject (Deny Edits)"),
                            Spacer()
                        )
                            .setMargin("0.5rem 0")
                            .setGap("0.5rem")
                            .setAlign("center"),

                    )
                ]).setValidator((val) => val.object({
                    respones: val.string().array().min(1),
                    denyEdits: val.boolean()
                })),
                Page({
                    responseText: "Hello World!\n\n\nWow What a view!",
                }, (data) => [
                    // TODO: Put this Component into webgen directly and clean it up
                    Box(
                        PlainText("Email Response"),
                        Custom((() => {
                            const ele = createElement("textarea");
                            ele.rows = 10;
                            ele.value = data.responseText;
                            ele.style.resize = "vertical";
                            ele.oninput = () => {
                                data.responseText = ele.value;
                            };
                            return ele;
                        })()),
                    )
                        .addClass("winput", "grayscaled", "has-value", "textarea")
                        .setMargin("0 0 .5rem"),
                    PlainText("Preview").setMargin("0 0 0.5rem"),
                    Reactive(data, "responseText", () => clientRender(dropPatternMatching(data.responseText, state.drop!))),
                ]).setValidator((v) => v.object({
                    responseText: v.string().refine(x => render(dropPatternMatching(x, state.drop!)).errors.length == 0, { message: "Invalid MJML" })
                })),
                Page({

                }, () => [
                    Vertical(

                        PlainText("Review almost completed! Last Click!"),
                        Horizontal(
                            Button("Download Store3k Image")
                                .onPromiseClick(async () => {
                                    saveBlob(await API.music(API.getToken()).id(state.drop!._id).artworkStore3k(), state.drop!.title + ".jpg");
                                }),
                            Spacer()
                        )
                    )
                        .setGap("1rem")
                        .setMargin("0 0 1rem")

                ])
            ]),
    )
        .setMargin("0 0 var(--gap)")
)
    .setTitle("Finish up that Drop!");
