import { format } from "std/fmt/bytes.ts";
import { Button, ButtonStyle, Card, Color, Dialog, Grid, Horizontal, MediaQuery, PlainText, Reactive, Spacer, TextInput, Vertical } from "webgen/mod.ts";
import { activeUser } from "../../manager/helper.ts";
import { MB, state } from "../data.ts";
import './details.css';

export const migrationInfo = {
    title: "Welcome to our Beta Dashboard!",
    text0: "We're excited to have you on board as we unveil our new and improved platform.",
    text1: "As we transition to this enhanced experience, we want to make sure you have a seamless migration process. To access your account on the old panel (Pterodactyl), simply click the button below to get access to your legacy password:",
    button: "Get your legacy password"
};

export const migrationDialog = () => Dialog(() => Vertical(
    PlainText(migrationInfo.text0),
    PlainText(migrationInfo.text1),
).addClass("dialog-max-width"))
    .setTitle(migrationInfo.title)
    .addButton("View legacy password", () => {
        migrationCredentials();
        return "close";
    })
    .addButton("Ok", "remove")
    .allowUserClose()
    .open();

export const migrationCredentials = () => Dialog(() =>
    Vertical(
        PlainText("If you want to login to the legacy panel (Pterodactyl) here is your migration password."),
        Grid(
            [
                {
                    width: 2
                },
                TextInput("email", "Username")
                    .setColor(Color.Disabled)
                    .setValue(activeUser.email)
            ],
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
    .addButton("Go to legacy panel", () => {
        open("https://panel.bbn.one/", "_blank");
        return "remove";
    }, Color.Colored, ButtonStyle.Inline)
    .open();

export const detailsView = () =>
    MediaQuery("(max-width: 700px)", (small) =>
        Reactive(state, "meta", () =>
            Grid(
                Card(
                    Grid(
                        PlainText(migrationInfo.title)
                            .setFont(2, 700),
                        PlainText(migrationInfo.text0),
                        PlainText(migrationInfo.text1),
                        Horizontal(
                            Spacer(),
                            Button(migrationInfo.button)
                                .setStyle(ButtonStyle.Inline)
                                .onClick(() => {
                                    migrationCredentials();
                                })
                        )
                    )
                        .addClass("details-item")
                ).addClass("full-width"),
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
                Card(
                    Grid(
                        PlainText(state.meta.used.cpu + "% / " + state.meta.limits.cpu + "%")
                            .setFont(2, 700),
                        PlainText("CPU")
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