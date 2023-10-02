import { API, Navigation, stupidErrorAlert } from "shared";
import { Button, Card, Color, Dialog, Grid, Label, MediaQuery, State, Table, TextInput, Vertical, View, WebGen, isMobile } from "webgen/mod.ts";
import { DynaNavigation } from "../../components/nav.ts";
import { Wallet } from "../../spec/music.ts";
import { RegisterAuthRefresh, changeThemeColor, renewAccessTokenIfNeeded } from "../_legacy/helper.ts";
import './wallet.css';

await RegisterAuthRefresh();

WebGen({
    events: {
        themeChanged: changeThemeColor()
    }
});

const state = State({
    wallet: <Wallet | undefined>undefined,
    loaded: false
});

async function handlePayoutResponse(amount: number) {
    const response = await API.wallet.requestPayout(amount);
    if (response.status === "fulfilled") {
        if (response.value.type === "createAccount") {
            Dialog(() => Vertical(
                Label("To process your payout, you need to create a Stripe account."),
                Label("Please click the button below to create your account.")
            )).addButton("Create Account", () => {
                if (response.value.type === "createAccount") {
                    window.location.href = response.value.url;
                    return "remove";
                }
            }).open();
        } else if (response.value.type === "needDetails") {
            Dialog(() => Vertical(
                Label("To process your payout, you need to fill out missing information."),
                Label("Please click the button below to provide the missing information.")
            )).addButton("Provide Information", () => {
                if (response.value.type === "needDetails") {
                    window.location.href = response.value.url;
                    return "remove";
                }
            }).open();
        } else {
            Dialog(() => {}).addButton("Close", "close").setTitle("Sucess!").onClose(() => refreshState()).open();
        }
    }
}

View(() => Vertical(
    DynaNavigation("Wallet"),
    state.$loaded.map(() => Vertical(
        Navigation({
            title: "Your Wallet",
            actions: [
                Button("Request Payout")
                    .onClick(() => {
                        const amount = State({ value: "" });
                        Dialog(() => Vertical(
                            Label("How much would you like to withdraw?"),
                            TextInput("text", "Amount").sync(amount, "value"),
                        )).addButton("Request", () => {
                            handlePayoutResponse(Number(amount.value));
                            return "remove";
                        }).open();
                        alert(`Your payout request has been submitted.`);
                    })
                    .setColor(state.wallet?.balance?.unrestrained! + state.wallet?.balance?.restrained! > 10 ? Color.Grayscaled : Color.Disabled)
            ]
        }).addClass(
            isMobile.map(mobile => mobile ? "mobile-navigation" : "navigation"),
            "limited-width"
        ),
        MediaQuery("(max-width: 700px)", (small) =>
            state.$wallet.map(() =>
                Vertical(
                    Grid(
                        Card(
                            Grid(
                                Label(`${Number(state.wallet?.balance?.unrestrained! + state.wallet?.balance?.restrained!).toFixed(2)} £`)
                                    .setFont(2, 700),
                                Label("Balance")
                                    .setFont(1, 700)
                                    .addClass("gray-color")
                            )
                                .addClass("details-item")
                        ),
                        Card(
                            Grid(
                                Label(`${state.wallet?.cut}%`)
                                    .setFont(2, 700),
                                Label("Your Cut")
                                    .setFont(1, 700)
                                    .addClass("gray-color")
                            )
                                .addClass("details-item")
                        ),
                    )
                        .setEvenColumns(small ? 1 : 2)
                        .setGap("var(--gap)"),
                    Table([
                        [ "Amount", "auto", ({ amount }) => Label(`${amount.toFixed(2)} £`) ],
                        [ "Description", "auto", ({ description }) => Label(description) ],
                        [ "Counterparty", "auto", ({ counterParty }) => Label(counterParty) ],
                        [ "Date", "auto", ({ timestamp }) => Label(new Date(Number(timestamp)).toDateString()) ],
                    ], state.wallet?.transactions ?? [])
                ).setGap("var(--gap)")
            ).asRefComponent()
        )
    )).asRefComponent().addClass("limited-width")
)).appendOn(document.body);

renewAccessTokenIfNeeded()
    .then(() => refreshState())
    .then(() => state.loaded = true);

async function refreshState() {
    state.wallet = await API.wallet.get().then(stupidErrorAlert);
    if (state.wallet)
        state.wallet.transactions = state.wallet.transactions.sort((a, b) => Number(b.timestamp) - Number(a.timestamp));
    state.loaded = true;
}