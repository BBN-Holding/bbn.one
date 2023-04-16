import { Card, Component, Grid, Horizontal, PlainText, Spacer, Vertical } from "webgen/mod.ts";
import { ViewState } from "./types.ts";

export function OverviewPanel(state: Partial<ViewState>): Component {
    return Vertical(
        Grid(
            card("Total Streams", "1.2M"),
            card("Total Revenue", "$1.2M"),
            card("Total Payouts", "$1.2M"),
        )
            .setGap("1.2rem")
            .setMargin("2.9rem 0")
            .setDynamicColumns(0, "1.5rem")
            .addClass("grid"),
    )
}

function card(title: string, description: string): [settings: {
    width?: number | undefined;
    heigth?: number | undefined;
}, element: Component] {
    return [
        { width: 6, heigth: 1 },
        Card(Vertical(
            Horizontal(
                PlainText(title)
                    .setFont(2.3, 900)
                    .addClass("font-big"),
                Spacer()
            ).setMargin("1.2rem 1rem 0.2rem"),
            Horizontal(
                PlainText(description)
                    .setFont(0.88, 500),
                Spacer()
            ).setMargin("0 1rem 1.2rem"),
            Spacer()
        ))
    ]
}