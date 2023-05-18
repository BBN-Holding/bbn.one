import { Card, Grid, MediaQuery, PlainText, Reactive } from "webgen/mod.ts";
import { MB, state } from "../data.ts";
import './details.css';
import { format } from "std/fmt/bytes.ts";

export const detailsView = () =>
    MediaQuery("(max-width: 700px)", (small) =>
        Reactive(state, "meta", () =>
            Grid(
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
                        PlainText(state.meta.used.slots + " / " + state.meta.limits.slots)
                            .setFont(2, 700),
                        PlainText("Servers")
                            .setFont(1, 700)
                            .addClass("gray-color")
                    )
                        .addClass("details-item")
                ),
                Card(
                    Grid(
                        PlainText(format(state.meta.used.memory * MB) + " / " + format(state.meta.limits.memory * MB))
                            .setFont(2, 700),
                        PlainText("Memory")
                            .setFont(1, 700)
                            .addClass("gray-color")
                    )
                        .addClass("details-item")
                ),
                Card(
                    Grid(
                        PlainText(format(state.meta.used.disk * MB) + " / " + format(state.meta.limits.disk * MB))
                            .setFont(2, 700),
                        PlainText("Disk")
                            .setFont(1, 700)
                            .addClass("gray-color")
                    )
                        .addClass("details-item")
                ),
            )
                .setEvenColumns(small ? 1 : 2)
                .setGap("var(--gap)")
                .addClass("limited-width", "details-grid")
        )
    );