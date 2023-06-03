import { format } from "std/fmt/bytes.ts";
import { Box, Button, ButtonStyle, Color, Dialog, Entry, Grid, Horizontal, MediaQuery, PlainText, Reactive, Spacer, TextInput, Vertical } from "webgen/mod.ts";
import { activeUser } from "../../manager/helper.ts";
import { MB, state } from "../data.ts";
import './profile.css';

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

export const profileView = () =>
    MediaQuery("(max-width: 700px)", (small) =>
        Reactive(state, "meta", () =>
            Grid(
                Entry(
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
                Entry(
                    Grid(
                        PlainText(state.meta.coins.toLocaleString())
                            .setFont(2, 700),
                        PlainText("Coins")
                            .setFont(1, 700)
                            .addClass("gray-color")
                    )
                        .addClass("details-item")
                ).addClass("full-width"),
                Box(
                    Entry(
                        Grid(
                            PlainText(state.meta.used.slots + " / " + state.meta.limits.slots)
                                .setFont(2, 700),
                            PlainText("Servers")
                                .setFont(1, 700)
                                .addClass("gray-color")
                        )
                            .addClass("details-item")
                    )
                        .addClass("docked"),
                    ShopStack("Upgrade available", {
                        type: "available",
                        label: "Add 1x Server",
                        sublabel: "Requires 100 Coins",
                        action: async () => {
                            //
                        }
                    })
                )
                    .addClass("shop"),
                Box(
                    Entry(
                        Grid(
                            PlainText(format(state.meta.used.memory * MB) + " / " + format(state.meta.limits.memory * MB))
                                .setFont(2, 700),
                            PlainText("Memory")
                                .setFont(1, 700)
                                .addClass("gray-color")
                        )
                            .addClass("details-item")
                    )
                        .addClass("docked"),
                    ShopStack("Not enough Coins", {
                        type: "blocked",
                        sublabel: "Requires 100 Coins",
                    })
                )
                    .addClass("shop"),
                Box(
                    Entry(
                        Grid(
                            PlainText(format(state.meta.used.disk * MB) + " / " + format(state.meta.limits.disk * MB))
                                .setFont(2, 700),
                            PlainText("Disk")
                                .setFont(1, 700)
                                .addClass("gray-color")
                        )
                            .addClass("details-item")
                    )
                        .addClass("docked"),
                    ShopStack("Recommended Upgrade", {
                        type: "recommended",
                        label: "Add 1x Server",
                        sublabel: "Requires 100 Coins",
                        action: async () => {
                            //
                        }
                    })
                )
                    .addClass("shop"),
                Box(
                    Entry(
                        Grid(
                            PlainText(state.meta.used.cpu + "% / " + state.meta.limits.cpu + "%")
                                .setFont(2, 700),
                            PlainText("CPU")
                                .setFont(1, 700)
                                .addClass("gray-color")
                        )
                            .addClass("details-item")
                    )
                        .addClass("docked"),
                    ShopStack("Not enough Coins", {
                        type: "blocked",
                        sublabel: "Requires 100 Coins",
                    })
                )
                    .addClass("shop")
            )
                .setEvenColumns(small ? 1 : 2)
                .setGap("var(--gap)")
                .addClass("limited-width", "details-grid")
        )
    );

type ShopVariant =
    | { type: 'available', label: string, sublabel: string, action: () => Promise<void>; }
    | { type: 'recommended', label: string, sublabel: string, action: () => Promise<void>; }
    | { type: 'blocked', sublabel: string, };

const ShopStack = (actionText: string, variant: ShopVariant) => Grid(
    PlainText(actionText),
    Vertical(
        variant.type != "blocked"
            ? Button(variant.label)
                .setStyle(ButtonStyle.Secondary)
                .setColor(Color.Colored)
                .onPromiseClick(variant.action)
            : null,
        PlainText(variant.sublabel).addClass("sublabel")
    ).addClass("group")
).addClass(variant.type, "shop-stack");
