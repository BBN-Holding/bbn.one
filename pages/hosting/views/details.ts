import { Card, Grid, PlainText, Reactive } from "webgen/mod.ts";
import { MB, state } from "../data.ts";
import './details.css';
import { format } from "std/fmt/bytes.ts";

export const detailsView = () => Reactive(state, "meta", () => Grid(
    Card(
        Grid(
            PlainText(state.meta.coins.toLocaleString())
                .setFont(2, 700),
            PlainText("Coins")
                .setFont(1, 700)
                .addClass("gray-color")
        )
            .addClass("details-item")
    ),

    Card(
        Grid(
            PlainText(format(state.meta.limits.memory * MB) + " / " + format(state.meta.limits.memory * MB))
                .setFont(2, 700),
            PlainText("Memory")
                .setFont(1, 700)
                .addClass("gray-color")
        )
            .addClass("details-item")
    ),

    Card(
        Grid(
            PlainText(format(state.meta.limits.disk * MB) + " / " + format(state.meta.limits.disk * MB))
                .setFont(2, 700),
            PlainText("Disk")
                .setFont(1, 700)
                .addClass("gray-color")
        )
            .addClass("details-item")
    ),
    // AYO THIS SHIT MISSING!?!?
    // Card(
    //     Grid(
    //         PlainText(state.meta.dbs[ 0 ] + " / " + state.meta.dbs[ 1 ])
    //             .setFont(2, 700),
    //         PlainText("Databases")
    //             .setFont(1, 700)
    //             .addClass("gray-color")
    //     )
    //         .addClass("details-item")
    // ),

    // Card(
    //     Grid(
    //         PlainText(state.meta.slots[ 0 ] + " / " + state.meta.slots[ 1 ])
    //             .setFont(2, 700),
    //         PlainText("Servers")
    //             .setFont(1, 700)
    //             .addClass("gray-color")
    //     )
    //         .addClass("details-item")
    // ),

    // Card(
    //     Grid(
    //         PlainText(state.meta.ports[ 0 ] + " / " + state.meta.ports[ 1 ])
    //             .setFont(2, 700),
    //         PlainText("Endpoints (Ports)")
    //             .setFont(1, 700)
    //             .addClass("gray-color")
    //     )
    //         .addClass("details-item")
    // )
)
    .setDynamicColumns(6, "20rem")
    .setGap("var(--gap)")
    .addClass("limited-width", "details-grid")
);