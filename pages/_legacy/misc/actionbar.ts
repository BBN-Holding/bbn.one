import { Box, Button, Color, Grid, Label, MIcon, Pointable, Pointer, Spacer, Taglist, Vertical } from "webgen/mod.ts";

export type Link = {
    title: string;
    color?: Pointable<Color>;
    onclick: () => Promise<void> | void;
};

export function ActionBar(title: Pointable<string>,
    categories?: { list: Pointable<string>[], selected: Pointer<number>; },
    action?: Link,
    history?: Link[]) {
    return Grid(
        Grid(
            Grid(
                ...(history ?? []).map(x =>
                    Box(
                        Label(x.title)
                            .addClass("label")
                            .setFont(2.260625, 700),
                        MIcon("arrow_forward_ios")
                    ).addClass("history-entry").onClick(x.onclick)
                ),
                Label(title)
                    .addClass("text")
                    .setFont(2.260625, 700),
                Spacer()
            ).addClass("history-list").setMargin("0 0 18px"),
            categories ?
                Taglist(categories.list, categories.selected)
                : Box(),
            Label("")
                .addClass("error-message", "hidden-message")
                .setId("error-message-area")
        ),
        action ?
            Vertical(
                Spacer(),
                Button(action.title)
                    .setColor(action.color ?? Color.Grayscaled)
                    .onPromiseClick(async () => { await action.onclick(); }),
                Spacer()
            ) : Box(),
    )
        .setPadding("5rem 0 0 0")
        .addClass("action-bar")
        .addClass("limited-width");
}