import { API } from "shared/mod.ts";
import { Box, Checkbox, Custom, Horizontal, Image, Label, Spacer, State, createElement } from "webgen/mod.ts";
import reviewTexts from "../../data/reviewTexts.json" with { type: "json" };
import { Drop, ReviewResponse } from "../../spec/music.ts";
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
export const dialogState = State({
    drop: <Drop | "loading">"loading"
});
export const ApproveDialog = Dialog(() =>
    dialogState.$drop.map(drop =>
        Box(
            drop === "loading"
                ? Box(Image({ type: "loading" }, "Loading...")).addClass("test")
                : Wizard({
                    buttonAlignment: "bottom",
                    buttonArrangement: 'flex-end',
                    cancelAction: () => {
                        ApproveDialog.close();
                    },
                    submitAction: async ([ { data: { data: { responseText } } } ]) => {
                        await API.music.id(drop._id).review.post({
                            title: dropPatternMatching(reviewTexts.APPROVED.header, drop),
                            reason: [ "APPROVED" ],
                            body: rawTemplate(dropPatternMatching(responseText, drop)),
                            denyEdits: false
                        });

                        ApproveDialog.close();
                    },
                }, () => [
                    Page({
                        responseText: reviewTexts.APPROVED.content.join("\n"),
                    }, (data) => [
                        // TODO: Put this Component into webgen directly and clean it up
                        Box(
                            Label("Email Response"),
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
                        Label("Preview")
                            .setMargin("0 0 0.5rem"),
                        data.$responseText
                            .map(() => clientRender(dropPatternMatching(data.responseText, drop)))
                            .asRefComponent(),
                    ]).setValidator((v) => v.object({
                        responseText: v.string().refine(x => render(dropPatternMatching(x, drop)).errors.length == 0, { message: "Invalid MJML" })
                    }))
                ]),
        )
            .setMargin("0 0 var(--gap)")
    ).asRefComponent()
)
    .allowUserClose()
    .setTitle("Approve Drop");

export const DeclineDialog = Dialog(() =>
    dialogState.$drop.map(drop =>
        Box(
            drop === "loading"
                ? Box(Image({ type: "loading" }, "Loading...")).addClass("test")
                : Wizard({
                    buttonAlignment: "bottom",
                    buttonArrangement: 'flex-end',
                    cancelAction: () => {
                        DeclineDialog.close();
                    },
                    submitAction: async ([ { data: { data: { respones, denyEdits } } }, { data: { data: { responseText } } } ]) => {
                        const reason = <ReviewResponse[]>respones;

                        await API.music.id(drop._id).review.post({
                            title: dropPatternMatching(reviewTexts.REJECTED.header, drop),
                            reason,
                            body: rawTemplate(dropPatternMatching(responseText, drop)),
                            denyEdits
                        });

                        DeclineDialog.close();
                    },
                    // deno-lint-ignore require-await
                    onNextPage: async ({ PageData }) => {
                        const data = PageData();
                        data[ 1 ].responseText = reviewTexts.REJECTED.content.join("\n")
                            .replace("{{REASON}}", (data[ 0 ].respones as Array<keyof typeof reviewTexts.REJECTED.reasonMap>)
                                .map(x => reviewTexts.REJECTED.reasonMap[ x ])
                                .filter(x => x)
                                .join(""));
                    }
                }, () => [
                    Page({
                        respones: [] as ReviewResponse[],
                        denyEdits: false
                    }, (data) => [
                        Box(
                            Label("Choose Rejection Reasons"),
                            ...rejectReasons
                                .map((rsp) =>
                                    Horizontal(
                                        Checkbox(data.respones.includes(rsp)).onClick(() => data.respones.includes(rsp) ? data.respones.splice(data.respones.indexOf(rsp), 1) : data.respones.push(rsp)),
                                        Label(reviewResponse[ rejectReasons.indexOf(rsp) ]),
                                        Spacer()
                                    )
                                        .setMargin("0.5rem 0")
                                        .setGap("0.5rem")
                                        .setAlign("center")
                                ),

                            Label("Choose Rejection Method"),
                            Horizontal(
                                Checkbox(data.denyEdits).onClick(() => data.denyEdits = !data.denyEdits),
                                Label("Reject (Deny Edits)"),
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
                            Label("Email Response"),
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
                        Label("Preview")
                            .setMargin("0 0 0.5rem"),
                        data.$responseText
                            .map(() => clientRender(dropPatternMatching(data.responseText, drop)))
                            .asRefComponent(),
                    ]).setValidator((v) => v.object({
                        responseText: v.string().refine(x => render(dropPatternMatching(x, drop)).errors.length == 0, { message: "Invalid MJML" })
                    }))
                ]),
        )
            .setMargin("0 0 var(--gap)")
    ).asRefComponent()
)
    .allowUserClose()
    .setTitle("Decline Drop");
