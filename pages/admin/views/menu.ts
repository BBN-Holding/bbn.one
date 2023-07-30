import { API, count, HeavyList, loadMore, Navigation, placeholder } from "shared";
import { sumOf } from "std/collections/sum_of.ts";
import { Box, Button, Color, Dialog, Entry, Grid, isMobile, Label, ref, State, TextInput } from "webgen/mod.ts";
import { DropType } from "../../../spec/music.ts";
import { activeUser } from "../../_legacy/helper.ts";
import { upload } from "../loading.ts";
import { state } from "../state.ts";
import { ReviewEntry } from "./entryReview.ts";
import { GroupEntry, UserEntry } from "./entryUser.ts";
import { entryFile, entryOAuth, entryWallet, transcriptMenu } from "./list.ts";

//TODO: Stats
export const adminMenu = Navigation({
    title: ref`Hi ${activeUser.$username} 👋`,
    categories: [
        {
            id: "overview",
            title: `Overview`,
            children: state.$payouts.map(it => it === "loading" || it.status === "rejected" ? [
                HeavyList(state.$payouts, () => Box())
            ] : [
                {
                    id: "streams",
                    title: "Total Streams",
                    subtitle: state.payouts ? `${sumOf(it.value, payout => sumOf(payout.entries, entry => sumOf(entry.data, data => data.quantity))).toLocaleString()} Streams` : "Loading..."
                },
                {
                    id: "revenue",
                    title: "Calculated Revenue",
                    subtitle: state.payouts ? `£ ${sumOf(it.value, payout => sumOf(payout.entries, entry => sumOf(entry.data, data => data.revenue))).toFixed(2)}` : "Loading..."
                },
                {
                    id: "gotten",
                    title: "Gotten Revenue",
                    subtitle: state.payouts ? `£ ${sumOf(it.value, payout => Number(payout.moneythisperiod.replace("£ ", "").replaceAll(',', ''))).toFixed(2)}` : "Loading..."
                },
                {
                    id: "bbnmoney",
                    title: "BBN Revenue",
                    subtitle: state.$wallets.map(it => it == "loading"
                        ? `---`
                        : it.status == "rejected"
                            ? "(failed)"
                            : "£ " + sumOf(Object.values(it.value.find(wallet => wallet.user === "62ea6fa5321b3702e93ca21c")?.balance!), e => e).toFixed(2) ?? 0
                    )
                }
            ])
        },
        {
            id: "reviews",
            title: ref`Drops`,
            children: [
                {
                    id: "reviews",
                    title: ref`Reviews ${count(state.drops.$reviews)}`,
                    children: [
                        HeavyList(state.drops.$reviews, it => ReviewEntry(it))
                            .setPlaceholder(placeholder("No Servers", "Welcome! Create a server to get going. 🤖🛠️"))
                            .enablePaging((offset, limit) => loadMore(state.drops.$reviews, () => API.admin(API.getToken()).drops.list(DropType.UnderReview, offset, limit)))
                    ]
                },
                {
                    id: "publishing",
                    title: ref`Publishing ${count(state.drops.$publishing)}`,
                    children: [
                        HeavyList(state.drops.$publishing, it => ReviewEntry(it))
                            .enablePaging((offset, limit) => loadMore(state.drops.$publishing, () => API.admin(API.getToken()).drops.list(DropType.Publishing, offset, limit)))
                    ]
                },
                {
                    id: "published",
                    title: ref`Published ${count(state.drops.$published)}`,
                    children: [
                        HeavyList(state.drops.$published, it => ReviewEntry(it))
                            .enablePaging((offset, limit) => loadMore(state.drops.$published, () => API.admin(API.getToken()).drops.list(DropType.Published, offset, limit)))
                    ]
                },
                {
                    id: "private",
                    title: ref`Private ${count(state.drops.$private)}`,
                    children: [
                        HeavyList(state.drops.$private, it => ReviewEntry(it))
                            .enablePaging((offset, limit) => loadMore(state.drops.$private, () => API.admin(API.getToken()).drops.list(DropType.Private, offset, limit)))
                    ]
                },
                {
                    id: "rejected",
                    title: ref`Rejected ${count(state.drops.$rejected)}`,
                    children: [
                        HeavyList(state.drops.$rejected, it => ReviewEntry(it))
                            .enablePaging((offset, limit) => loadMore(state.drops.$rejected, () => API.admin(API.getToken()).drops.list(DropType.ReviewDeclined, offset, limit)))
                    ]
                },
                {
                    id: "drafts",
                    title: ref`Drafts ${count(state.drops.$drafts)}`,
                    children: [
                        HeavyList(state.drops.$drafts, it => ReviewEntry(it))
                            .enablePaging((offset, limit) => loadMore(state.drops.$drafts, () => API.admin(API.getToken()).drops.list(DropType.Unsubmitted, offset, limit)))
                    ]
                },
            ]
        },
        {
            id: "users",
            title: ref`User ${count(state.$users)}`,
            children: [
                HeavyList(state.$users, (val) => UserEntry(val))
                    .enablePaging((offset, limit) => loadMore(state.$users, () => API.admin(API.getToken()).users.list(offset, limit)))
            ]
        },
        {
            id: "groups",
            title: ref`Groups ${count(state.$groups)}`,
            children: [
                HeavyList(state.$groups, (val) => GroupEntry(val))
                    .enablePaging((offset, limit) => loadMore(state.$groups, () => API.admin(API.getToken()).groups.list(offset, limit)))
            ]
        },
        {
            id: "payouts",
            title: ref`Payout ${count(state.$payouts)}`,
            children: [
                {
                    title: "Upload Payout File (.xlsx)",
                    id: "upload+manual",
                    clickHandler: () => {
                        upload("manual");
                    }
                },
                {
                    title: "Sync ISRCs (release_export.xlsx)",
                    id: "sync+isrc",
                    clickHandler: () => {
                        upload("isrc");
                    }
                },
                HeavyList(state.$payouts, (x) => Entry({
                    title: x.period,
                    subtitle: x.moneythisperiod,
                }).onClick(() => {
                    location.href = `/music/payout?id=${x._id}`;
                }))
            ],
        },
        {
            id: "oauth",
            title: ref`OAuth ${count(state.$oauth)}`,
            children: state.$oauth.map(it => it === "loading" || it.status === "rejected"
                ? [ HeavyList(state.$oauth, entryOAuth) ]
                : [
                    {
                        title: "Create new OAuth Application",
                        id: "add+oauth",
                        clickHandler: () => {
                            addOAuthDialog.open();
                        }
                    },
                    HeavyList(state.$oauth, entryOAuth)
                ])
        },
        {
            id: "files",
            title: ref`Files ${count(state.$files)}`,
            children: [ HeavyList(state.$files, entryFile)
            ]
        },
        {
            id: "servers",
            title: ref`Minecraft Servers ${count(state.$servers)}`,
            children: [
                // HeavyList(state.$servers, it => entryServer(State(it) as StateHandler<Server>, true))
                // .enablePaging((offset, limit) => loadMore(state.$servers, () => API.admin(API.getToken()).servers.list(offset, limit)))
            ]
        },
        {
            id: "wallets",
            title: ref`Wallets ${count(state.$wallets)}`,
            children: [ HeavyList(state.$wallets, entryWallet)
                .enablePaging((offset, limit) => loadMore(state.$wallets, () => API.admin(API.getToken()).wallets.list(offset, limit)))
            ]
        },
        {
            id: "transcripts",
            title: ref`Tickets ${count(state.$transcripts)}`,
            children:
                state.$transcripts.map(it => transcriptMenu(it))
        },
    ]
})
    .addClass(
        isMobile.map(mobile => mobile ? "mobile-navigation" : "navigation"),
        "limited-width"
    );

const oAuthData = State({
    name: "",
    redirectURI: "",
    image: ""
});
const addOAuthDialog = Dialog(() =>
    Grid(
        Label("Create new OAuth Application"),
        TextInput("text", "Name").sync(oAuthData, "name"),
        TextInput("text", "Redirect URI").sync(oAuthData, "redirectURI"),
        Button("Upload Image").onPromiseClick(async () => {
            oAuthData.image = await upload("oauth");
        }),
        oAuthData.$image.map((img) =>
            Button("Submit")
                .setColor(img === "" ? Color.Disabled : Color.Grayscaled)
                .onClick(() => {
                    API.oauth(API.getToken()).post(oAuthData.name, oAuthData.redirectURI, oAuthData.image);
                    addOAuthDialog.close();
                })
        ).asRefComponent()
    ).setGap("10px")
)
    .setTitle("Create new OAuth Application")
    .allowUserClose();