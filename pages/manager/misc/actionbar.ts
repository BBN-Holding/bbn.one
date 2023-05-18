import { Box, Button, ButtonStyle, Color, Component, Grid, Horizontal, Icon, PlainText, Spacer, Vertical } from "webgen/mod.ts";

export type Link = {
    title: string;
    onclick: () => Promise<void> | void;
};

export function ActionBar(title: string,
    categories?: { title: string, selected: boolean, onclick: () => void, hide?: boolean; }[],
    action?: Link,
    history?: Link[]) {
    return Grid(
        Grid(
            Grid(
                ...(history ?? []).map(x =>
                    Box(
                        PlainText(x.title)
                            .setFont(2.260625, 700),
                        Icon("arrow_forward_ios")
                    ).addClass("history-entry").onClick(x.onclick)
                ),
                PlainText(title)
                    .addClass("text")
                    .setFont(2.260625, 700),
                Spacer()
            ).setMargin("0 0 18px"),
            categories && categories.length != 0 ?
                Horizontal(
                    ...[
                        ...categories.map(x =>
                            !x.hide ? Button(x.title)
                                .setColor(Color.Colored)
                                .addClass("tag")
                                .setStyle(x.selected ? ButtonStyle.Normal : ButtonStyle.Secondary)
                                .onClick(x.onclick) : null
                        ),
                    ].filter(x => x) as Component[],
                    Spacer()
                ).addClass("category-list").setGap("10px") : Box(),
            PlainText("")
                .addClass("error-message", "hidden-message")
                .setId("error-message-area")
        ),
        action ?
            Vertical(
                Spacer(),
                Button(action.title)
                    .onPromiseClick(async () => { await action.onclick(); }),
                Spacer()
            ) : Box(),
    )
        .setPadding("5rem 0 0 0")
        .addClass("action-bar")
        .addClass("limited-width");
}