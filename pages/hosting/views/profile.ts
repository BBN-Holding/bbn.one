import { confettiFromElement } from "shared/libs/canvasConfetti.ts";
import { API, stupidErrorAlert } from "shared/mod.ts";
import { format } from "std/fmt/bytes.ts";
import { Box, Button, ButtonStyle, Color, Empty, Entry, Grid, Label, MediaQuery, Referenceable, Vertical } from "webgen/mod.ts";
import { MB, state } from "../data.ts";
import { refreshState } from "../loading.ts";
import './profile.css';

export const profileView = () =>
    MediaQuery("(max-width: 700px)", (small) =>
        state.$meta.map(meta =>
            Grid(
                Entry(
                    Grid(
                        Label(meta.coins.toLocaleString())
                            .setTextSize("4xl")
                            .setFontWeight("bold"),
                        Label("Coins")
                            .setFontWeight("bold")
                            .addClass("gray-color")
                    )
                        .addClass("details-item")
                ).addClass("full-width"),
                Box(
                    Entry(
                        Grid(
                            Label(`${meta.used.slots} / ${meta.limits.slots}`)
                                .setTextSize("4xl")
                                .setFontWeight("bold"),
                            Label("Servers")
                                .setFontWeight("bold")
                                .addClass("gray-color")
                        )
                            .addClass("details-item")
                    )
                        .addClass("docked"),
                    meta.pricing.slots ? ShopStack(meta.pricing.slots.price > meta.coins ? "Not enough Coins" : "Upgrade available", {
                        type: meta.pricing.slots.price > meta.coins ? "blocked" : "available",
                        label: `Add x${meta.pricing.slots.amount} Servers`,
                        sublabel: `Requires ${meta.pricing.slots.price} Coins`,
                        action: async (ev) => {
                            await API.hosting.store.create("slots")
                                .then(stupidErrorAlert);
                            confettiFromElement(ev);
                            refreshState();
                        }
                    }) :
                        Empty()
                )
                    .addClass("shop"),
                Box(
                    Entry(
                        Grid(
                            Label(`${format(meta.used.memory * MB)} / ${format(meta.limits.memory * MB)}`)
                                .setTextSize("4xl")
                                .setFontWeight("bold"),
                            Label("Memory")
                                .setFontWeight("bold")
                                .addClass("gray-color")
                        )
                            .addClass("details-item")
                    )
                        .addClass("docked"),
                    meta.pricing.memory ? ShopStack(meta.pricing.memory.price > meta.coins ? "Not enough Coins" : "Upgrade available", {
                        type: meta.pricing.memory.price > meta.coins ? "blocked" : "available",
                        label: `Add ${format((meta.pricing.memory.amount ?? 0) * MB)}`,
                        sublabel: `Requires ${meta.pricing.memory.price} Coins`,
                        action: async (ev) => {
                            await API.hosting.store.create("memory")
                                .then(stupidErrorAlert);
                            confettiFromElement(ev);
                            refreshState();
                        }
                    }) :
                        Empty()
                )
                    .addClass("shop"),
                Box(
                    Entry(
                        Grid(
                            Label(`${format(meta.used.disk * MB)} / ${format(meta.limits.disk * MB)}`)
                                .setTextSize("4xl")
                                .setFontWeight("bold"),
                            Label("Disk")
                                .setFontWeight("bold")
                                .addClass("gray-color")
                        )
                            .addClass("details-item")
                    )
                        .addClass("docked"),
                    meta.pricing.disk ? ShopStack(meta.pricing.disk.price > meta.coins ? "Not enough Coins" : "Upgrade available", {
                        type: meta.pricing.disk.price > meta.coins ? "blocked" : "available",
                        label: `Add ${format(meta.pricing.disk.amount * MB)}`,
                        sublabel: `Requires ${meta.pricing.disk.price} Coins`,
                        action: async (ev) => {
                            await API.hosting.store.create("disk")
                                .then(stupidErrorAlert);
                            confettiFromElement(ev);
                            refreshState();
                        }
                    }) :
                        Empty()
                )
                    .addClass("shop"),
                Box(
                    Entry(
                        Grid(
                            Label(`${meta.used.cpu}% / ${meta.limits.cpu}%`)
                                .setTextSize("4xl")
                                .setFontWeight("bold"),
                            Label("CPU")
                                .setFontWeight("bold")
                                .addClass("gray-color")
                        )
                            .addClass("details-item")
                    )
                        .addClass("docked"),
                    meta.pricing.cpu ? ShopStack(meta.pricing.cpu.price > meta.coins ? "Not enough Coins" : "Upgrade available", {
                        type: meta.pricing.cpu.price > meta.coins ? "blocked" : "available",
                        label: `Add ${meta.pricing.cpu.amount} %`,
                        sublabel: `Requires ${meta.pricing.cpu.price} Coins`,
                        action: async (ev) => {
                            await API.hosting.store.create("cpu")
                                .then(stupidErrorAlert);
                            confettiFromElement(ev);
                            refreshState();
                        }
                    }) :
                        Empty()
                )
                    .addClass("shop")
            )
                .setEvenColumns(small ? 1 : 2)
                .setGap()
                .addClass("details-grid")
        ).asRefComponent()
    );

type ShopVariant =
    { type: 'available' | 'recommended' | 'blocked', label: Referenceable<string>, sublabel: Referenceable<string>, action: (env: MouseEvent) => Promise<void>; };

const ShopStack = (actionText: string, variant: ShopVariant) => Grid(
    Label(actionText),
    Vertical(
        variant.type == "blocked"
            ? null
            : Button(variant.label)
                .setStyle(ButtonStyle.Secondary)
                .setColor(Color.Colored)
                .onPromiseClick(variant.action),
        Label(variant.sublabel).addClass("sublabel")
    ).addClass("group")
).addClass(variant.type, "shop-stack");
