import { API, count, HeavyList, loadMore, Menu, placeholder } from "shared";
import { sumOf } from "std/collections/sum_of.ts";
import { Box, Button, Color, Dialog, Entry, Grid, PlainText, Reactive, ref, State, StateHandler, TextInput } from "webgen/mod.ts";
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
            items: state.$payouts.map(it => it === "loading" || it.status === "rejected" ? [] : [
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
                    subtitle: state.$wallets.map(it => it == "loading"
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
            title: ref`Drops`,
            items: [
                {
                    id: "reviews/",
                    title: ref`Reviews ${count(state.drops.$reviews)}`,
                    custom: () => HeavyList(state.drops.$reviews, it => ReviewEntry(it))
                        .setPlaceholder(placeholder("No Servers", "Welcome! Create a server to get going. 🤖🛠️"))
                        .enablePaging((offset, limit) => loadMore(state.drops.$reviews, () => API.admin(API.getToken()).drops.list(DropType.UnderReview, offset, limit)))
                },
                {
                    id: "publishing/",
                    title: ref`Publishing ${count(state.drops.$publishing)}`,
                    custom: () => HeavyList(state.drops.$publishing, it => ReviewEntry(it))
                        .enablePaging((offset, limit) => loadMore(state.drops.$publishing, () => API.admin(API.getToken()).drops.list(DropType.Publishing, offset, limit)))
                },
                {
                    id: "published/",
                    title: ref`Published ${count(state.drops.$published)}`,
                    custom: () => HeavyList(state.drops.$published, it => ReviewEntry(it))
                        .enablePaging((offset, limit) => loadMore(state.drops.$published, () => API.admin(API.getToken()).drops.list(DropType.Published, offset, limit)))
                },
                {
                    id: "private/",
                    title: ref`Private ${count(state.drops.$private)}`,
                    custom: () => HeavyList(state.drops.$private, it => ReviewEntry(it))
                        .enablePaging((offset, limit) => loadMore(state.drops.$private, () => API.admin(API.getToken()).drops.list(DropType.Private, offset, limit)))
                },
                {
                    id: "rejected/",
                    title: ref`Rejected ${count(state.drops.$rejected)}`,
                    custom: () => HeavyList(state.drops.$rejected, it => ReviewEntry(it))
                        .enablePaging((offset, limit) => loadMore(state.drops.$rejected, () => API.admin(API.getToken()).drops.list(DropType.ReviewDeclined, offset, limit)))
                },
                {
                    id: "drafts/",
                    title: ref`Drafts ${count(state.drops.$drafts)}`,
                    custom: () => HeavyList(state.drops.$drafts, it => ReviewEntry(it))
                        .enablePaging((offset, limit) => loadMore(state.drops.$drafts, () => API.admin(API.getToken()).drops.list(DropType.Unsubmitted, offset, limit)))
                },
            ]
        },
        "users/": {
            title: ref`User ${count(state.$users)}`,
            custom: () => HeavyList(state.$users, (val) => UserEntry(val))
                .enablePaging((offset, limit) => loadMore(state.$users, () => API.admin(API.getToken()).users.list(offset, limit)))

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
                    .addClass("limited-width")
        },
        "oauth/": {
            title: ref`OAuth ${count(state.$oauth)}`,
            items: state.$oauth.map(it => it === "loading" || it.status === "rejected" ? [] : [
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
                    .addClass("limited-width")
        },
        "files/": {
            title: ref`Files ${count(state.$files)}`,
            custom: () => HeavyList(state.$files, entryFile)

        },
        "servers/": {
            title: ref`Minecraft Servers ${count(state.$servers)}`,
            custom: () => HeavyList(state.$servers, it => entryServer(State(it) as StateHandler<Server>, true))
                .addClass("limited-width")
                .enablePaging((offset, limit) => loadMore(state.$servers, () => API.admin(API.getToken()).servers.list(offset, limit)))
        },
        "wallets/": {
            title: ref`Wallets ${count(state.$wallets)}`,
            custom: () => HeavyList(state.$wallets, entryWallet)
                .addClass("limited-width")
                .enablePaging((offset, limit) => loadMore(state.$wallets, () => API.admin(API.getToken()).wallets.list(offset, limit)))
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