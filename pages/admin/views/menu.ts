import { API, count, HeavyList, Menu } from "shared";
import { sumOf } from "std/collections/sum_of.ts";
import { Box, Button, Color, Dialog, Entry, Grid, PlainText, Reactive, ref, refMap, State, StateHandler, TextInput, Vertical } from "webgen/mod.ts";
import { DropType, Server } from "../../../spec/music.ts";
import { entryServer } from "../../hosting/views/list.ts";
import { activeUser } from "../../manager/helper.ts";
import { upload } from "../loading.ts";
import { state } from "../state.ts";
import { ReviewEntry } from "./entryReview.ts";
import { UserEntry } from "./entryUser.ts";
import { entryFile, entryOAuth, entryWallet } from "./list.ts";

export const adminMenu = Menu({
    title: ref`Hi ${activeUser.$username} 👋`,
    id: "/",
    categories: {
        "overview/": {
            title: `Overview`,
            items: refMap(state.$payouts, it => it === "loading" || it.status === "rejected" ? [] : [
                {
                    id: "streams/",
                    title: "Total Streams",
                    subtitle: state.payouts ? `${sumOf(it.value, payout => sumOf(payout.entries, entry => sumOf(entry.data, data => data.quantity))).toLocaleString()} Streams` : "Loading..."
                },
                {
                    id: "revenue/",
                    title: "Calculated Revenue",
                    subtitle: state.payouts ? `£ ${sumOf(it.value, payout => sumOf(payout.entries, entry => sumOf(entry.data, data => data.revenue))).toFixed(2)}` : "Loading..."
                },
                {
                    id: "gotten/",
                    title: "Gotten Revenue",
                    subtitle: state.payouts ? `£ ${sumOf(it.value, payout => Number(payout.moneythisperiod.replace("£ ", "").replaceAll(',', ''))).toFixed(2)}` : "Loading..."
                },
                {
                    id: "bbnmoney/",
                    title: "BBN Revenue",
                    subtitle: refMap(state.$wallets,
                        it => it == "loading"
                            ? `---`
                            : it.status == "rejected"
                                ? "(failed)"
                                : "£ " + sumOf(Object.values(it.value.find(wallet => wallet.user === "62ea6fa5321b3702e93ca21c")?.balance!), e => e).toFixed(2) ?? 0
                    )
                }
            ]),
            custom: () => HeavyList(state.$payouts, () => Box())
        },
        "reviews/": {
            title: ref`Music Reviews ${count(state.$reviews)}`,
            custom: refMap(state.$reviews, reviews =>
                reviews === "loading" || reviews.status === "rejected"
                    // Display Loading Spinner or Error
                    ? () => HeavyList(reviews, () => Box())
                    : () => Vertical(
                        PlainText("Reviews")
                            .addClass("list-title")
                            .addClass("limited-width"),
                        HeavyList(reviews.value.filter(x => x.type === DropType.UnderReview), it => ReviewEntry(it)),
                        //
                        PlainText("Publishing")
                            .addClass("list-title")
                            .addClass("limited-width"),
                        HeavyList(reviews.value.filter(x => x.type === DropType.Publishing), it => ReviewEntry(it)),
                        //
                        PlainText("Published")
                            .addClass("list-title")
                            .addClass("limited-width"),
                        HeavyList(reviews.value.filter(x => x.type === DropType.Published), it => ReviewEntry(it)),
                        //
                        PlainText("Private")
                            .addClass("list-title")
                            .addClass("limited-width"),
                        HeavyList(reviews.value.filter(x => x.type === DropType.Private), it => ReviewEntry(it)),
                        //
                        PlainText("Rejected")
                            .addClass("list-title")
                            .addClass("limited-width"),
                        HeavyList(reviews.value.filter(x => x.type === DropType.ReviewDeclined), it => ReviewEntry(it)),
                        //
                        PlainText("Drafts")
                            .addClass("list-title")
                            .addClass("limited-width"),
                        HeavyList(reviews.value.filter(x => x.type === DropType.Unsubmitted), it => ReviewEntry(it)),
                    )
                        .setGap("var(--gap)")
            )

        },
        "users/": {
            title: ref`User ${count(state.$users)}`,
            custom: () => HeavyList(state.$users, (val) => UserEntry(val))
        },
        "payouts/": {
            title: ref`Payout ${count(state.$payouts)}`,
            items: [
                {
                    title: "Upload Payout File (.xlsx)",
                    id: "upload+manual/",
                    action: () => {
                        upload("manual");
                    }
                },
                {
                    title: "Sync ISRCs (release_export.xlsx)",
                    id: "sync+isrc/",
                    action: () => {
                        upload("isrc");
                    }
                }
            ],
            custom: () =>
                HeavyList(state.$payouts, (x) => Entry({
                    title: x.period,
                    subtitle: x.moneythisperiod,
                }).onClick(() => {
                    location.href = `/music/payout?id=${x._id}&userid=${activeUser.id}`;
                }))
                    .setMargin("var(--gap)")
        },
        "oauth/": {
            title: ref`OAuth ${count(state.$oauth)}`,
            items: refMap(state.$oauth, it => it === "loading" || it.status === "rejected" ? [] : [
                {
                    title: "Create new OAuth Application",
                    id: "add+oauth/",
                    action: () => {
                        addOAuthDialog.open();
                    }
                }
            ]),
            custom: () =>
                HeavyList(state.$oauth, entryOAuth)
                    .setMargin("var(--gap)")
        },
        "files/": {
            title: ref`Files ${count(state.$files)}`,
            custom: () => HeavyList(state.$files, entryFile)

        },
        "servers/": {
            title: ref`Minecraft Servers ${count(state.$servers)}`,
            custom: () => HeavyList(state.$servers, it => entryServer(it as StateHandler<Server>, true))
        },
        "wallets/": {
            title: ref`Wallets ${count(state.$wallets)}`,
            custom: () => HeavyList(state.$wallets, entryWallet)
        }
    }
})
    .setActivePath('/overview/');

const oAuthData = State({
    name: "",
    redirectURI: "",
    image: ""
});
const addOAuthDialog = Dialog(() =>
    Grid(
        PlainText("Create new OAuth Application"),
        TextInput("text", "Name").sync(oAuthData, "name"),
        TextInput("text", "Redirect URI").sync(oAuthData, "redirectURI"),
        Button("Upload Image").onPromiseClick(async () => {
            oAuthData.image = await upload("oauth");
        }),
        Reactive(oAuthData, "image", () =>
            Button("Submit")
                .setColor(oAuthData.image === "" ? Color.Disabled : Color.Grayscaled)
                .onClick(() => {
                    API.oauth(API.getToken()).post(oAuthData.name, oAuthData.redirectURI, oAuthData.image);
                    addOAuthDialog.close();
                })
        )
    ).setGap("10px")
)
    .setTitle("Create new OAuth Application")
    .allowUserClose();