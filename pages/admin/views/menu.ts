import { API, count, LoadingSpinner, Menu } from "shared";
import { sumOf } from "std/collections/sum_of.ts";
import { Button, Color, Dialog, Grid, PlainText, Reactive, ref, refMap, State, StateHandler, TextInput } from "webgen/mod.ts";
import { Server } from "../../../spec/music.ts";
import { listView } from "../../hosting/views/list.ts";
import { activeUser } from "../../manager/helper.ts";
import { listPayouts } from "../../music/views/list.ts";
import { upload } from "../loading.ts";
import { state } from "../state.ts";
import { UserPanel } from "../users.ts";
import { listFiles, listOAuth, listReviews, listWallets } from "./list.ts";

export const adminMenu = Reactive(state, "loaded", () => Menu({
    title: ref`Hi ${activeUser.$username} 👋`,
    id: "/",
    categories: {
        "overview/": {
            title: `Overview`,
            items: [
                {
                    id: "streams/",
                    title: "Total Streams",
                    subtitle: state.payouts ? `${sumOf(state.payouts, payout => sumOf(payout.entries, entry => sumOf(entry.data, data => data.quantity))).toLocaleString()} Streams` : "Loading..."
                },
                {
                    id: "revenue/",
                    title: "Calculated Revenue",
                    subtitle: state.payouts ? `£ ${sumOf(state.payouts, payout => sumOf(payout.entries, entry => sumOf(entry.data, data => data.revenue))).toFixed(2)}` : "Loading..."
                },
                {
                    id: "gotten/",
                    title: "Gotten Revenue",
                    subtitle: state.payouts ? `£ ${sumOf(state.payouts, payout => Number(payout.moneythisperiod.replace("£ ", "").replaceAll(',', ''))).toFixed(2)}` : "Loading..."
                },
                {
                    id: "bbnmoney/",
                    title: "BBN Revenue",
                    subtitle: state.wallets ? `£ ${sumOf(Object.values(state.wallets.find(wallet => wallet.user === "62ea6fa5321b3702e93ca21c")?.balance!), e => e).toFixed(2) ?? 0}` : "Loading..."
                }
            ]
        },
        "reviews/": {
            title: ref`Music Reviews ${count(state.$reviews)}`,
            custom: listReviews
        },
        "users/": {
            title: ref`User ${count(state.$users)}`,
            custom: UserPanel
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
            custom: () => listPayouts(state.payouts ?? [], true)
        },
        "oauth/": {
            title: ref`OAuth ${count(state.$oauth)}`,
            items: [
                {
                    title: "Create new OAuth Application",
                    id: "add+oauth/",
                    action: () => {
                        addOAuthDialog.open();
                    }
                }
            ],
            custom: () => listOAuth(state.oauth ?? [])
        },
        "files/": {
            title: ref`Files ${count(state.$files)}`,
            custom: () => listFiles(state.files ?? [])

        },
        "servers/": {
            title: ref`Minecraft Servers ${count(state.$servers)}`,
            custom: () => listView(state.servers as StateHandler<Server[]>)
        },
        "wallets/": {
            title: ref`Wallets ${count(state.$wallets)}`,
            custom: () => listWallets(state.wallets ?? [])
        }
    },
    custom: () => LoadingSpinner()
})
    .setActivePath(refMap(state.$loaded, loaded => loaded ? '/overview/' : '/'))
);

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
    .allowUserClose()