import { API, LoadingSpinner, Navigation, stupidErrorAlert } from "shared/mod.ts";
import { asState, Body, Button, Color, Grid, isMobile, Label, LinkButton, MediaQuery, SheetDialog, Table, TextInput, Vertical, WebGen } from "webgen/mod.ts";
import { DynaNavigation } from "../../components/nav.ts";
import { Wallet } from "../../spec/music.ts";
import { changeThemeColor, RegisterAuthRefresh, renewAccessTokenIfNeeded, sheetStack } from "../shared/helper.ts";
import "./wallet.css";

await RegisterAuthRefresh();

WebGen({
    events: {
        themeChanged: changeThemeColor(),
    },
});

const state = asState({
    wallet: <Wallet | undefined> undefined,
});

async function handlePayoutResponse(amount: number) {
    const response = await API.wallet.requestPayout(amount).then(stupidErrorAlert);
    if (response.type === "createAccount") {
        SheetDialog(
            sheetStack,
            "Missing Account",
            Grid(
                Label("To process your payout, you need to create a Stripe account."),
                Label("Please click the button below to create your account."),
                LinkButton("Create Account", response.url),
            )
                .setGap()
                .setMargin("10px"),
        ).open();
    } else if (response.type === "needDetails") {
        SheetDialog(
            sheetStack,
            "Missing Information",
            Grid(
                Label("To process your payout, you need to fill out missing information."),
                Label("Please click the button below to provide the missing information."),
                LinkButton("Provide Information", response.url),
            )
                .setGap()
                .setMargin("10px"),
        ).open();
    } else {
        SheetDialog(
            sheetStack,
            "Success!",
            Grid(
                Label("Your payout request has been sent for processing."),
                Label("You will receive an email once the payout has been processed."),
            )
                .setGap()
                .setMargin("10px"),
        );
    }
}

sheetStack.setDefault(Vertical(
    DynaNavigation("Wallet"),
    state.$wallet.map((wallet) =>
        wallet
            ? Vertical(
                Navigation({
                    title: "Your Wallet",
                    actions: [
                        Button("Request Payout")
                            .setColor(wallet.balance?.unrestrained! + wallet.balance?.restrained! > 10 ? Color.Grayscaled : Color.Disabled)
                            .onClick(() => {
                                const amount = asState({ value: "0" });
                                const dialog = SheetDialog(
                                    sheetStack,
                                    "Request Payout",
                                    Grid(
                                        Label("How much would you like to withdraw?"),
                                        TextInput("text", "Amount").sync(amount, "value"),
                                        Button("Request")
                                            .onClick(() => {
                                                handlePayoutResponse(Number(amount.value));
                                                dialog.close();
                                            }),
                                    )
                                        .setGap()
                                        .setMargin("10px"),
                                );
                                dialog.open();
                            }),
                    ],
                }).addClass(
                    isMobile.map((mobile) => mobile ? "mobile-navigation" : "navigation"),
                    "limited-width",
                ),
                MediaQuery("(max-width: 700px)", (small) =>
                    Vertical(
                        Grid(
                            Grid(
                                Label(`${Number(wallet.balance?.unrestrained! + wallet.balance?.restrained!).toFixed(2)} £`)
                                    .setTextSize("4xl")
                                    .setFontWeight("bold"),
                                Label("Balance")
                                    .setFontWeight("bold")
                                    .addClass("gray-color"),
                            )
                                .addClass("details-item"),
                            Grid(
                                Label(`${wallet.cut}%`)
                                    .setTextSize("4xl")
                                    .setFontWeight("bold"),
                                Label("Your Cut")
                                    .setFontWeight("bold")
                                    .addClass("gray-color"),
                            )
                                .addClass("details-item"),
                        )
                            .setWidth("100%")
                            .setEvenColumns(small ? 1 : 2)
                            .setGap(),
                        Table([
                            ["Amount", "auto", ({ amount }) => Label(`${amount.toFixed(2)} £`)],
                            ["Description", "auto", ({ description }) => Label(description)],
                            ["Counterparty", "auto", ({ counterParty }) => Label(counterParty)],
                            ["Date", "auto", ({ timestamp }) => Label(new Date(Number(timestamp)).toDateString())],
                        ], wallet.transactions),
                    ).setGap()),
            ).addClass("limited-width")
            : LoadingSpinner()
    ).asRefComponent(),
));

Body(sheetStack);

renewAccessTokenIfNeeded()
    .then(async () => state.wallet = await API.wallet.get().then(stupidErrorAlert));
