import { CenterV, Horizontal, Icon, PlainText, Spacer } from "webgen/mod.ts";

export function Entry(text: string, subtext?: string, action?: () => void) {
    return Horizontal(
        CenterV(
            PlainText(text)
                .setFont(1.5, 700),
            ...subtext ? [
                Spacer(),
                PlainText(subtext)
                    .setFont(1, 700)
                    .addClass("subtitle")
            ] : []
        )
            .addClass("meta-data"),
        Spacer(),
        action ? CenterV(Icon("arrow_forward_ios")) : null
    )
        .onClick((() => { action?.(); }))
        .setPadding("18px 24px")
        .addClass("list-entry", action ? "action" : "no-actions", "limited-width");
}
