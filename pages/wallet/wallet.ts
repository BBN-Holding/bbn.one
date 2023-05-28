import { API } from "shared";
import { Card, Color, Grid, MaterialIcons, MediaQuery, PlainText, Reactive, State, Table, Vertical, View, WebGen } from "webgen/mod.ts";
import { DynaNavigation } from "../../components/nav.ts";
import { Wallet } from "../../spec/music.ts";
import { RegisterAuthRefresh, renewAccessTokenIfNeeded } from "../manager/helper.ts";
import { changeThemeColor } from "../manager/misc/common.ts";
import { Menu } from "../shared/menu.ts";
import './wallet.css';

await RegisterAuthRefresh();

WebGen({
    icon: new MaterialIcons(),
    events: {
        themeChanged: changeThemeColor()
    }
});

const state = State({
    wallet: <Wallet | undefined>undefined,
    loaded: false
});

View(() => Vertical(
    DynaNavigation("Wallet"),
    Reactive(state, "loaded", () => Vertical(
        Menu({
            title: "Your Wallet",
            id: "/",
            menuBarAction: {
                title: "Request Payout",
                color: state.wallet?.balance?.unrestrained! + state.wallet?.balance?.restrained! > 0 ? Color.Grayscaled : Color.Disabled,
                onclick: async () => {
                    await API.wallet(API.getToken()).requestPayout();
                    alert(`Your payout request has been submitted.`)
                }
            },
        }),
        MediaQuery("(max-width: 700px)", (small) =>
            Reactive(state, "wallet", () =>
                Vertical(
                    Grid(
                        Card(
                            Grid(
                                PlainText(Number(state.wallet?.balance?.unrestrained! + state.wallet?.balance?.restrained!).toFixed(2) + " £")
                                    .setFont(2, 700),
                                PlainText("Balance")
                                    .setFont(1, 700)
                                    .addClass("gray-color")
                            )
                                .addClass("details-item")
                        ),
                        Card(
                            Grid(
                                PlainText(state.wallet?.cut + "%")
                                    .setFont(2, 700),
                                PlainText("Your Cut")
                                    .setFont(1, 700)
                                    .addClass("gray-color")
                            )
                                .addClass("details-item")
                        ),
                    )
                        .setEvenColumns(small ? 1 : 2)
                        .setGap("var(--gap)")
                        .addClass("limited-width", "details-grid"),
                    Table([
                        [ "Amount", "auto", ({ amount }) => PlainText(amount.toFixed(2) + " £") ],
                        [ "Description", "auto", ({ description }) => PlainText(description) ],
                        [ "Counterparty", "auto", ({ counterParty }) => PlainText(counterParty) ],
                        [ "Date", "auto", ({ timestamp }) => PlainText(new Date(Number(timestamp)).toDateString()) ],
                    ], state.wallet?.transactions ?? [])
                ).setGap("var(--gap)")
            )
        )
    )).addClass("limited-width")
)).appendOn(document.body);

renewAccessTokenIfNeeded()
    .then(() => refreshState())
    .then(() => state.loaded = true);

async function refreshState() {
    state.wallet = await API.wallet(API.getToken()).get();
    state.wallet.transactions = state.wallet.transactions.sort((a, b) => Number(b.timestamp) - Number(a.timestamp));
    state.loaded = true;
}