// @deno-types="https://raw.githubusercontent.com/DefinitelyTyped/DefinitelyTyped/master/types/canvas-confetti/index.d.ts"
import confetti from "https://unpkg.com/canvas-confetti@1.6.0/src/confetti.js";
import { format } from "std/fmt/bytes.ts";
import { Box, Button, ButtonStyle, Color, Dialog, Entry, Grid, Horizontal, Label, MediaQuery, Pointable, Spacer, TextInput, Vertical } from "webgen/mod.ts";
import { activeUser } from "../../_legacy/helper.ts";
import { HeavyReRender } from "../../shared/list.ts";
import { API, stupidErrorAlert } from "../../shared/mod.ts";
import { MB, state } from "../data.ts";
import { refreshState } from "../loading.ts";
import './profile.css';

function confettiFromElement(element: MouseEvent, opts: confetti.Options = {}) {
    const { top, height, left, width, } = (<HTMLElement>element.target!).getBoundingClientRect();
    const x = (left + width / 2) / window.innerWidth;
    const y = (top + height / 2) / window.innerHeight;
    const origin = { x, y };
    confetti({ origin, ...opts });
}
export const migrationInfo = {
    title: "Welcome to our Beta Dashboard!",
    text0: "We're excited to have you on board as we unveil our new and improved platform.",
    text1: "As we transition to this enhanced experience, we want to make sure you have a seamless migration process. To access your account on the old panel (Pterodactyl), simply click the button below to get access to your legacy password:",
    button: "Get your legacy password"
};

export const migrationDialog = () => Dialog(() => Vertical(
    Label(migrationInfo.text0),
    Label(migrationInfo.text1),
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
        Label("If you want to login to the legacy panel (Pterodactyl) here is your migration password."),
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
        state.$meta.map(() =>
            Grid(
                state.meta.pteroId ? Entry(
                    Grid(
                        Label(migrationInfo.title)
                            .setFont(2, 700),
                        Label(migrationInfo.text0),
                        Label(migrationInfo.text1),
                        Horizontal(
                            Spacer(),
                            Button(migrationInfo.button)
                                .setStyle(ButtonStyle.Secondary)
                                .onClick(() => {
                                    migrationCredentials();
                                })
                        )
                    )
                        .addClass("details-item")
                ).addClass("full-width") : Box(),
                Entry(
                    Grid(
                        Label(state.meta.coins.toLocaleString())
                            .setFont(2, 700),
                        Label("Coins")
                            .setFont(1, 700)
                            .addClass("gray-color")
                    )
                        .addClass("details-item")
                ).addClass("full-width"),
                Box(
                    Entry(
                        Grid(
                            Label(state.meta.used.slots + " / " + state.meta.limits.slots)
                                .setFont(2, 700),
                            Label("Servers")
                                .setFont(1, 700)
                                .addClass("gray-color")
                        )
                            .addClass("details-item")
                    )
                        .addClass("docked"),
                    HeavyReRender(state.meta.pricing.slots, slots => !slots ? Box() :
                        ShopStack(slots.price > state.meta.coins ? "Not enough Coins" : "Upgrade available", {
                            type: slots.price > state.meta.coins ? "blocked" : "available",
                            label: `Add x${slots.ammount} Servers`,
                            sublabel: `Requires ${slots.price} Coins`,
                            action: async (ev) => {
                                await API.hosting(API.getToken()).store.create("slots")
                                    .then(stupidErrorAlert);
                                confettiFromElement(ev);
                                refreshState();
                            }
                        })
                    ).removeFromLayout()
                )
                    .addClass("shop"),
                Box(
                    Entry(
                        Grid(
                            Label(format(state.meta.used.memory * MB) + " / " + format(state.meta.limits.memory * MB))
                                .setFont(2, 700),
                            Label("Memory")
                                .setFont(1, 700)
                                .addClass("gray-color")
                        )
                            .addClass("details-item")
                    )
                        .addClass("docked"),
                    HeavyReRender(state.meta.pricing.memory, memory => !memory ? Box() :
                        ShopStack(memory.price > state.meta.coins ? "Not enough Coins" : "Upgrade available", {
                            type: memory.price > state.meta.coins ? "blocked" : "available",
                            label: `Add ${format((memory.ammount ?? 0) * MB)}`,
                            sublabel: `Requires ${memory.price} Coins`,
                            action: async (ev) => {
                                await API.hosting(API.getToken()).store.create("memory")
                                    .then(stupidErrorAlert);
                                confettiFromElement(ev);
                                refreshState();
                            }
                        })
                    ).removeFromLayout()
                )
                    .addClass("shop"),
                Box(
                    Entry(
                        Grid(
                            Label(format(state.meta.used.disk * MB) + " / " + format(state.meta.limits.disk * MB))
                                .setFont(2, 700),
                            Label("Disk")
                                .setFont(1, 700)
                                .addClass("gray-color")
                        )
                            .addClass("details-item")
                    )
                        .addClass("docked"),
                    HeavyReRender(state.meta.pricing.disk, disk => !disk ? Box() :
                        ShopStack(disk.price > state.meta.coins ? "Not enough Coins" : "Upgrade available", {
                            type: disk.price > state.meta.coins ? "blocked" : "available",
                            label: `Add ${format(disk.ammount * MB)}`,
                            sublabel: `Requires ${disk.price} Coins`,
                            action: async (ev) => {
                                await API.hosting(API.getToken()).store.create("disk")
                                    .then(stupidErrorAlert);
                                confettiFromElement(ev);
                                refreshState();
                            }
                        })
                    ).removeFromLayout()
                )
                    .addClass("shop"),
                Box(
                    Entry(
                        Grid(
                            Label(state.meta.used.cpu + "% / " + state.meta.limits.cpu + "%")
                                .setFont(2, 700),
                            Label("CPU")
                                .setFont(1, 700)
                                .addClass("gray-color")
                        )
                            .addClass("details-item")
                    )
                        .addClass("docked"),
                    HeavyReRender(state.meta.pricing.cpu, cpu => !cpu ? Box() :
                        ShopStack(cpu.price > state.meta.coins ? "Not enough Coins" : "Upgrade available", {
                            type: cpu.price > state.meta.coins ? "blocked" : "available",
                            label: `Add ${cpu.ammount} %`,
                            sublabel: `Requires ${cpu.price} Coins`,
                            action: async (ev) => {
                                await API.hosting(API.getToken()).store.create("cpu")
                                    .then(stupidErrorAlert);
                                confettiFromElement(ev);
                                refreshState();
                            }
                        })
                    ).removeFromLayout()
                )
                    .addClass("shop")
            )
                .setEvenColumns(small ? 1 : 2)
                .setGap("var(--gap)")
                .addClass("details-grid")
        ).asRefComponent()
    );

type ShopVariant =
    { type: 'available' | 'recommended' | 'blocked', label: Pointable<string>, sublabel: Pointable<string>, action: (env: MouseEvent) => Promise<void>; };

const ShopStack = (actionText: string, _variant: ShopVariant) => Grid(
    Label(actionText),
    HeavyReRender(_variant, (variant) => Vertical(
        variant.type != "blocked"
            ? Button(variant.label)
                .setStyle(ButtonStyle.Secondary)
                .setColor(Color.Colored)
                .onPromiseClick(variant.action)
            : null,
        Label(variant.sublabel).addClass("sublabel")
    ).addClass("group"))
).addClass(_variant.type, "shop-stack");
