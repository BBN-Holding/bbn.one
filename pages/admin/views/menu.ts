import { API, HeavyList, loadMore, Navigation, placeholder } from "shared/mod.ts";
import { sumOf } from "std/collections/mod.ts";
import { asState, Box, Button, Color, Grid, Horizontal, isMobile, Label, ref, SheetDialog, Spacer, Table, TextInput, Vertical } from "webgen/mod.ts";
import { DropType } from "../../../spec/music.ts";
import { activeUser, sheetStack } from "../../_legacy/helper.ts";
import { upload } from "../loading.ts";
import { state } from "../state.ts";
import { ReviewEntry } from "./entryReview.ts";
import { GroupEntry, UserEntry } from "./entryUser.ts";
import { entryFile, entryOAuth, entryWallet, transcriptMenu } from "./list.ts";

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
                    subtitle: it ? `${sumOf(it.value, payouts => sumOf(payouts, payout => sumOf(payout.entries, entry => sumOf(entry.data, data => data.quantity)))).toLocaleString()} Streams` : "Loading..."
                },
                {
                    id: "revenue",
                    title: "Calculated Revenue",
                    subtitle: it ? `£ ${sumOf(it.value, payouts => sumOf(payouts, payout => sumOf(payout.entries, entry => sumOf(entry.data, data => data.revenue)))).toFixed(2)}` : "Loading..."
                },
                {
                    id: "bbnmoney",
                    title: "BBN Revenue",
                    subtitle: state.$wallets.map(it => it == "loading"
                        ? `---`
                        : it.status == "rejected"
                            ? "(failed)"
                            : `£ ${sumOf(Object.values(it.value.find(wallet => wallet.user === "62ea6fa5321b3702e93ca21c")?.balance!), e => e).toFixed(2)}` ?? 0
                    )
                }
            ])
        },
        {
            id: "drops",
            title: ref`Drops`,
            children: [
                {
                    id: "reviews",
                    title: ref`Reviews`,
                    children: [
                        HeavyList(state.drops.$reviews, it => ReviewEntry(it))
                            .setPlaceholder(placeholder("No Servers", "Welcome! Create a server to get going. 🤖🛠️"))
                            .enablePaging((offset, limit) => loadMore(state.drops.$reviews, () => API.admin.drops.list(DropType.UnderReview, offset, limit)))
                    ]
                },
                {
                    id: "publishing",
                    title: ref`Publishing`,
                    children: [
                        HeavyList(state.drops.$publishing, it => ReviewEntry(it))
                            .enablePaging((offset, limit) => loadMore(state.drops.$publishing, () => API.admin.drops.list(DropType.Publishing, offset, limit)))
                    ]
                },
                {
                    id: "published",
                    title: ref`Published`,
                    children: [
                        HeavyList(state.drops.$published, it => ReviewEntry(it))
                            .enablePaging((offset, limit) => loadMore(state.drops.$published, () => API.admin.drops.list(DropType.Published, offset, limit)))
                    ]
                },
                {
                    id: "private",
                    title: ref`Private`,
                    children: [
                        HeavyList(state.drops.$private, it => ReviewEntry(it))
                            .enablePaging((offset, limit) => loadMore(state.drops.$private, () => API.admin.drops.list(DropType.Private, offset, limit)))
                    ]
                },
                {
                    id: "rejected",
                    title: ref`Rejected`,
                    children: [
                        HeavyList(state.drops.$rejected, it => ReviewEntry(it))
                            .enablePaging((offset, limit) => loadMore(state.drops.$rejected, () => API.admin.drops.list(DropType.ReviewDeclined, offset, limit)))
                    ]
                },
                {
                    id: "drafts",
                    title: ref`Drafts`,
                    children: [
                        HeavyList(state.drops.$drafts, it => ReviewEntry(it))
                            .enablePaging((offset, limit) => loadMore(state.drops.$drafts, () => API.admin.drops.list(DropType.Unsubmitted, offset, limit)))
                    ]
                },
            ]
        },
        {
            id: "users",
            title: ref`User`,
            children: [
                HeavyList(state.$users, val => UserEntry(val))
                    .enablePaging((offset, limit) => loadMore(state.$users, () => API.admin.users.list(offset, limit)))
            ]
        },
        {
            id: "groups",
            title: ref`Groups`,
            children: [
                HeavyList(state.$groups, val => GroupEntry(val))
                    .enablePaging((offset, limit) => loadMore(state.$groups, () => API.admin.groups.list(offset, limit)))
            ]
        },
        {
            id: "payouts",
            title: ref`Payout`,
            children: state.$payouts.map(payoutsdata => [
                {
                    title: "Upload Payout File (.xlsx)",
                    id: "upload+manual",
                    clickHandler: () => {
                        upload("manual");
                    }
                },
                {
                    title: "Sync Mapping with internal Backend",
                    id: "sync",
                    clickHandler: async () => {
                        await API.admin.drops.sync();
                    }
                },
                ...payoutsdata === "loading" || payoutsdata.status === "rejected" ? [ Box() ] : payoutsdata.value.map(payouts => ({
                    title: payouts[ 0 ].period,
                    id: `payouts${payouts[ 0 ].period}`,
                    subtitle: `£ ${sumOf(payouts, payout => sumOf(payout.entries, entry => sumOf(entry.data, data => data.revenue))).toFixed(2)}`,
                    children: payouts.map(payout => ({
                        title: payout._id,
                        subtitle: `£ ${sumOf(payout.entries, entry => sumOf(entry.data, data => data.revenue)).toFixed(2)}`,
                        children: payout.entries.map(entry => ({
                            title: entry.isrc,
                            subtitle: `£ ${sumOf(entry.data, data => data.revenue).toFixed(2)}`,
                            children: entry.data.map(data => ({
                                title: data.revenue,
                                subtitle: `£ ${data.revenue.toFixed(2)}`
                            }))
                        }))
                    }))
                }))
            ]),
        },
        {
            id: "oauth",
            title: ref`OAuth`,
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
            title: ref`Files`,
            children: [ HeavyList(state.$files, entryFile)
            ]
        },
        {
            id: "servers",
            title: ref`Minecraft Servers`,
            children: [
                // HeavyList(state.$servers, it => entryServer(State(it) as StateHandler<Server>, true))
                // .enablePaging((offset, limit) => loadMore(state.$servers, () => API.admin.servers.list(offset, limit)))
            ]
        },
        {
            id: "wallets",
            title: ref`Wallets`,
            children: [ HeavyList(state.$wallets, entryWallet)
                .enablePaging((offset, limit) => loadMore(state.$wallets, () => API.admin.wallets.list(offset, limit)))
            ]
        },
        {
            id: "transcripts",
            title: ref`Tickets`,
            children:
                state.$transcripts.map(it => transcriptMenu(it))
        },
    ]
})
    .addClass(
        isMobile.map(mobile => mobile ? "mobile-navigation" : "navigation"),
        "limited-width"
    );

const oAuthData = asState({
    name: "",
    redirectURI: [ "" ],
    image: ""
});

const addOAuthDialog = SheetDialog(sheetStack, "Create new OAuth Application",
    Grid(
        Label("Create new OAuth Application"),
        TextInput("text", "Name").sync(oAuthData, "name"),
        oAuthData.$redirectURI.map(x =>
            Vertical(
                Table([
                    [ "URI", "auto", (_, index) =>
                        TextInput("text", "URI", "blur")
                            .setValue(x[ index ])
                            .onChange((data) => {
                                x[ index ] = data ?? "";
                            })
                    ]
                ], x)
                    .setDelete((_, index) => {
                        oAuthData.redirectURI = asState(x.filter((_, i) => i != index));
                    }),
                Horizontal(
                    Spacer(),
                    Button("Add URI")
                        .onClick(() => {
                            x.push("");
                        })
                ).setPadding("0 0 3rem 0")
            )
                .setGap()
                .setWidth("clamp(0rem, 100vw, 60vw)")
                .setMargin("0 -.6rem 0 0"),
        ).asRefComponent(),
        Button("Upload Image").onPromiseClick(async () => {
            oAuthData.image = await upload("oauth");
        }),
        oAuthData.$image.map((img) =>
            Button("Submit")
                .setColor(img === "" ? Color.Disabled : Color.Grayscaled)
                .onClick(() => {
                    API.oauth.post(oAuthData.name, oAuthData.redirectURI, oAuthData.image)
                        .then(async () => {
                            oAuthData.name = "";
                            oAuthData.redirectURI = asState([ "" ]);
                            oAuthData.image = "";
                            addOAuthDialog.close();
                            state.oauth = await API.oauth.list();
                        });
                })
        ).asRefComponent()
    ).setGap("10px")
);