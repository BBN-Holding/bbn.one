import { Box, Card, Center, Grid, Horizontal, PlainText, Reactive, Spacer, Vertical } from "https://raw.githubusercontent.com/lucsoft/WebGen/3f922fc/mod.ts";
import { data } from "../data.ts";
import './details.css';
import { format } from "https://deno.land/std@0.182.0/fmt/bytes.ts";
export const detailsView = Reactive(data, "meta", () => Grid(
    Card(
        Grid(
            PlainText(data.meta.coins.toLocaleString())
                .setFont(2, 700),
            PlainText("Coins")
                .setFont(1, 700)
                .addClass("gray-color")
        )
            .addClass("details-item")
    ),

    Card(
        Grid(
            PlainText(format(data.meta.ram[ 0 ]) + " / " + format(data.meta.ram[ 1 ]))
                .setFont(2, 700),
            PlainText("Memory")
                .setFont(1, 700)
                .addClass("gray-color")
        )
            .addClass("details-item")
    ),

    Card(
        Grid(
            PlainText(format(data.meta.disk[ 0 ]) + " / " + format(data.meta.disk[ 1 ]))
                .setFont(2, 700),
            PlainText("Disk")
                .setFont(1, 700)
                .addClass("gray-color")
        )
            .addClass("details-item")
    ),

    Card(
        Grid(
            PlainText(data.meta.dbs[ 0 ] + " / " + data.meta.dbs[ 1 ])
                .setFont(2, 700),
            PlainText("Databases")
                .setFont(1, 700)
                .addClass("gray-color")
        )
            .addClass("details-item")
    ),

    Card(
        Grid(
            PlainText(data.meta.slots[ 0 ] + " / " + data.meta.slots[ 1 ])
                .setFont(2, 700),
            PlainText("Servers")
                .setFont(1, 700)
                .addClass("gray-color")
        )
            .addClass("details-item")
    ),

    Card(
        Grid(
            PlainText(data.meta.ports[ 0 ] + " / " + data.meta.ports[ 1 ])
                .setFont(2, 700),
            PlainText("Endpoints (Ports)")
                .setFont(1, 700)
                .addClass("gray-color")
        )
            .addClass("details-item")
    )
)
    .setDynamicColumns(6, "20rem")
    .setGap("var(--gap)")
    .addClass("limited-width", "details-grid")
);