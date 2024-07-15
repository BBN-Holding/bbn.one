import { DropDownSearch } from "shared/DropDownSearch.ts";
import { API, stupidErrorAlert } from "shared/mod.ts";
import { asState, Body, Content, Grid, Label, LinkButton, SheetDialog, Vertical, WebGen } from "webgen/mod.ts";
import { DynaNavigation } from "../../components/nav.ts";
import { Wallet } from "../../spec/music.ts";
import { changeThemeColor, RegisterAuthRefresh, renewAccessTokenIfNeeded, sheetStack } from "../_legacy/helper.ts";
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
    Content(DropDownSearch("dings", ["1", "2"])),
));

Body(sheetStack);

renewAccessTokenIfNeeded()
    .then(async () => state.wallet = await API.wallet.get().then(stupidErrorAlert));
