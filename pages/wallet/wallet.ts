import { API, LoadingSpinner, Navigation, stupidErrorAlert } from "shared/mod.ts";
import { Body, Button, Card, Center, Color, Grid, Label, LinkButton, MediaQuery, Sheet, Sheets, State, Table, TextInput, Vertical, WebGen, isMobile } from "webgen/mod.ts";
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
    wallet: <Wallet | undefined>undefined
});

async function handlePayoutResponse(amount: number) {
    const response = await API.wallet.requestPayout(amount).then(stupidErrorAlert);
    if (response.type === "createAccount") {
        sheets.add(Sheet(
            Grid(
                Center(Label("Missing Account").setTextSize("2xl").setFontWeight("bold")),
                Label("To process your payout, you need to create a Stripe account."),
                Label("Please click the button below to create your account."),
                LinkButton("Create Account", response.url)
            )
                .setGap()
                .setMargin("10px")
        ));
    } else if (response.type === "needDetails") {
        sheets.add(Sheet(
            Grid(
                Center(Label("Missing Information").setTextSize("2xl").setFontWeight("bold")),
                Label("To process your payout, you need to fill out missing information."),
                Label("Please click the button below to provide the missing information."),
                LinkButton("Provide Information", response.url)
            )
                .setGap()
                .setMargin("10px")
        ));
    } else {
        sheets.add(Sheet(
            Grid(
                Center(Label("Success!").setTextSize("2xl").setFontWeight("bold")),
                Label("Your payout request has been sent for processing."),
                Label("You will receive an email once the payout has been processed.")
            )
                .setGap()
                .setMargin("10px")
        ));
    }
}

const sheets = Sheets(Vertical(
    DynaNavigation("Wallet"),
    state.$wallet.map(wallet => wallet ? Vertical(
        Navigation({
            title: "Your Wallet",
            actions: [
                Button("Request Payout")
                    .onClick(() => {
                        const amount = State({ value: "0" });
                        const sheet = Sheet(
                            Grid(
                                Grid(
                                    Label("Payout Request").setTextSize("2xl").setFontWeight("bold"),
                                ),
                                Label("How much would you like to withdraw?"),
                                TextInput("text", "Amount").sync(amount, "value"),
                                Button("Request")
                                    .onClick(() => {
                                        handlePayoutResponse(Number(amount.value));
                                        sheets.remove(sheet);
                                    })
                            )
                                .setGap()
                                .setMargin("10px")
                        );
                        sheets.add(sheet);
                    })
                    .setColor(wallet.balance?.unrestrained! + wallet.balance?.restrained! > 10 ? Color.Grayscaled : Color.Disabled)
            ]
        }).addClass(
            isMobile.map(mobile => mobile ? "mobile-navigation" : "navigation"),
            "limited-width"
        ),
        MediaQuery("(max-width: 700px)", (small) =>
            Vertical(
                Grid(
                    Card(
                        Grid(
                            Label(`${Number(wallet.balance?.unrestrained! + wallet.balance?.restrained!).toFixed(2)} £`)
                                .setTextSize("4xl")
                                .setFontWeight("bold"),
                            Label("Balance")
                                .setTextSize("base")
                                .setFontWeight("bold")
                                .addClass("gray-color")
                        )
                            .addClass("details-item")
                    ),
                    Card(
                        Grid(
                            Label(`${wallet.cut}%`)
                                .setTextSize("4xl")
                                .setFontWeight("bold"),
                            Label("Your Cut")
                                .setTextSize("base")
                                .setFontWeight("bold")
                                .addClass("gray-color")
                        )
                            .addClass("details-item")
                    ),
                )
                    .setEvenColumns(small ? 1 : 2)
                    .setGap(),
                Table([
                    [ "Amount", "auto", ({ amount }) => Label(`${amount.toFixed(2)} £`) ],
                    [ "Description", "auto", ({ description }) => Label(description) ],
                    [ "Counterparty", "auto", ({ counterParty }) => Label(counterParty) ],
                    [ "Date", "auto", ({ timestamp }) => Label(new Date(Number(timestamp)).toDateString()) ],
                ], wallet.transactions)
            ).setGap()
        )
    ).addClass("limited-width") : LoadingSpinner()
    ).asRefComponent()
))
    .setSheetWidth("auto")
    .setSheetHeight("auto");

Body(sheets);

renewAccessTokenIfNeeded()
    .then(async () => state.wallet = await API.wallet.get().then(stupidErrorAlert));