import { Button, ButtonStyle, Card, Color, Dialog, Grid, Horizontal, MediaQuery, PlainText, Reactive, Spacer, TextInput, Vertical } from "webgen/mod.ts";
import { MB, state } from "../data.ts";
import './details.css';
import { format } from "std/fmt/bytes.ts";

export const detailsView = () =>
    MediaQuery("(max-width: 700px)", (small) =>
        Reactive(state, "meta", () =>
            Grid(
                Card(
                    Grid(
                        PlainText("Welcome to our Beta Dashboard!")
                            .setFont(2, 700),
                        PlainText("We're excited to have you on board as we unveil our new and improved platform."),
                        PlainText("As we transition to this enhanced experience, we want to make sure you have a seamless migration process. To access your account on the old panel, simply click the button below to get access to your legacy password:"),
                        Horizontal(
                            Spacer(),
                            Button("Get your legacy password")
                                .setStyle(ButtonStyle.Inline)
                                .onClick(() => {
                                    Dialog(() =>
                                        Vertical(
                                            PlainText("If you want to login to the legacy panel here is you migration password."),
                                            PlainText("Notice: You can change your password in the legacy panel."),
                                            PlainText("This is only the creation password of you migrated account."),
                                            Grid(
                                                TextInput("text", "Password")
                                                    .setColor(Color.Disabled)
                                                    .setValue(state.meta.migrationPassword),
                                                Button("Copy")
                                                    .onClick(() => {
                                                        navigator.clipboard.writeText(state.meta.migrationPassword);
                                                    })
                                            )
                                                .setGap("0.5rem")
                                                .setMargin("1rem 0 0.5rem 0")
                                                .setRawColumns("auto max-content")
                                        )
                                    )
                                        .setTitle("View legacy password")
                                        .allowUserClose()
                                        .addButton("Close", "remove", Color.Grayscaled, ButtonStyle.Inline)
                                        .open();
                                })
                        )
                    )
                        .addClass("details-item")
                ).addClass("full-width")
                ,
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