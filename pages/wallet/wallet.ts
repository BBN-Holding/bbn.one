import { API, stupidErrorAlert } from "shared/mod.ts";
import { appendBody, asRef, Box, Color, Content, DialogContainer, FullWidthSection, Grid, Label, PrimaryButton, Spinner, Table, WebGenTheme } from "webgen/mod.ts";
import { DynaNavigation } from "../../components/nav.ts";
import { AccountType, Wallet } from "../../spec/music.ts";
import { RegisterAuthRefresh, renewAccessTokenIfNeeded, sheetStack } from "../shared/helper.ts";

await RegisterAuthRefresh();

const wallet = asRef<Wallet | undefined>(undefined);

appendBody(
    WebGenTheme(
        DialogContainer(sheetStack.visible(), sheetStack),
        Content(
            FullWidthSection(
                DynaNavigation("Wallet"),
            ),
            Box(wallet.map((wallet) =>
                wallet
                    ? Grid(
                        Grid(
                            Label("Your Wallet").setFontWeight("bold").setTextSize("3xl"),
                            PrimaryButton("Request Payout").onClick(() => {
                                alert("Please email support@bbn.one and include your PayPal Address");
                            }),
                        ).setGap().setTemplateColumns("1fr auto"),
                        Grid(
                            Grid(
                                Label(`${Number(wallet.balance?.unrestrained! + wallet.balance?.restrained!).toFixed(2)} £`)
                                    .setTextSize("4xl")
                                    .setFontWeight("bold"),
                                Label("Balance")
                                    .setFontWeight("bold")
                                    .addClass("gray-color"),
                            )
                                .setCssStyle("background", "#181010")
                                .setPadding("1rem")
                                .setCssStyle("borderRadius", "var(--wg-radius-mid)"),
                            Grid(
                                Label(wallet.accountType == AccountType.Default ? "Basic" : AccountType.Subscribed ? "Premium" : "VIP")
                                    .setTextSize("4xl")
                                    .setFontWeight("bold"),
                                Label("Your Subscription")
                                    .setFontWeight("bold")
                                    .addClass("gray-color"),
                            )
                                .setCssStyle("background", "#181010")
                                .setPadding("1rem")
                                .setCssStyle("borderRadius", "var(--wg-radius-mid)"),
                            Grid(
                                Label(`${wallet.cut}%`)
                                    .setTextSize("4xl")
                                    .setFontWeight("bold"),
                                Label("Your Cut")
                                    .setFontWeight("bold")
                                    .addClass("gray-color"),
                            )
                                .setCssStyle("background", "#181010")
                                .setPadding("1rem")
                                .setCssStyle("borderRadius", "var(--wg-radius-mid)"),
                        ).setTemplateColumns("50% 25% 25%").setGap(),
                        Table(
                            asRef(wallet.transactions.map((x) => {
                                const { amount, description, counterParty, timestamp } = x;
                                return ({ amount, description, counterParty, timestamp });
                            })),
                            asRef({
                                amount: {
                                    titleRenderer: () => Label("Amount"),
                                    cellRenderer: (amount) => Label(`${Number(amount).toFixed(2)} £`),
                                    columnWidth: "auto",
                                },
                                description: {
                                    titleRenderer: () => Label("Description"),
                                    columnWidth: "auto",
                                },
                                timestamp: {
                                    titleRenderer: () => Label("Date"),
                                    cellRenderer: (timestamp) => Label(new Date(Number(timestamp)).toDateString()),
                                    columnWidth: "auto",
                                },
                                counterParty: {
                                    titleRenderer: () => Label("Counterparty"),
                                    columnWidth: "auto",
                                },
                            }),
                        ),
                    ).setGap().setMargin("5rem 0 2rem")
                    : Spinner()
            )),
        ),
    ).setPrimaryColor(new Color("#eb8c2d")),
);

renewAccessTokenIfNeeded()
    .then(async () => wallet.setValue(await API.wallet.get().then(stupidErrorAlert)));
