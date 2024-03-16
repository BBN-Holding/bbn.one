import { debounce } from "https://deno.land/std@0.220.1/async/debounce.ts";
import loader from "https://esm.sh/@monaco-editor/loader@1.4.0";
import { API, HeavyList, loadMore, Navigation, placeholder, stupidErrorAlert } from "shared/mod.ts";
import { sumOf } from "std/collections/mod.ts";
import { asState, Box, Button, Color, Custom, Entry, Grid, Horizontal, isMobile, Items, Label, lazyInit, ref, SheetDialog, Spacer, Table, TextInput, Vertical } from "webgen/mod.ts";
import { Drop, DropType, Server, Transcript } from "../../../spec/music.ts";
import { activeUser, ProfileData, sheetStack, showProfilePicture } from "../../_legacy/helper.ts";
import { upload } from "../loading.ts";
import { state } from "../state.ts";
import { ReviewEntry } from "./entryReview.ts";
import { GroupEntry } from "./entryUser.ts";
import { entryFile, entryOAuth, entryWallet, transcriptMenu } from "./list.ts";

const lazyMonaco = lazyInit(() => loader.init());

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
            id: "search",
            title: ref`Search`,
            children: [
                TextInput("text", "Search").onChange(debounce(async (data) => {
                    state.search = asState(await API.admin.search(data ?? "").then(stupidErrorAlert));
                }, 1000)),
                Items(state.$search.map(it => it as ({ type: "transcript", val: Transcript; } | { type: "drop", val: Drop; } | { type: "server", val: Server; } | { type: "user", val: ProfileData; })[]), it => {
                    switch (it.type) {
                        case "transcript":
                            return Entry(
                                {
                                    title: it.val.with,
                                    subtitle: it.type
                                }
                            );
                        case "drop":
                            return ReviewEntry(it.val)
                        case "server":
                            return Entry(
                                {
                                    title: it.val._id,
                                    subtitle: it.type
                                }
                            );
                        case "user":
                            return Entry({
                                title: it.val.profile.username,
                                subtitle: `${it.val._id} - ${it.val.profile.email}`
                            })
                                .addClass("small")
                                .onPromiseClick(async () => {
                                    const monaco = await lazyMonaco();
                                    const box = document.createElement("div");
                                    const editor = monaco.editor.create(box, {
                                        value: JSON.stringify(it.val, null, 2),
                                        language: "json",
                                        theme: "vs-dark",
                                        automaticLayout: true,
                                    });
                        
                        
                                    SheetDialog(sheetStack, "User", Custom(box).setHeight("800px").setWidth("1200px")).open();
                                })
                                .addPrefix(showProfilePicture(it.val));
                    }
                })
            ]
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
                }
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
                        id: `payouts${payouts[ 0 ].period}${payout._id}`,
                        children: payout.entries.map(entry => ({
                            title: entry.isrc,
                            id: `payouts${payouts[ 0 ].period}${payout._id}${entry.isrc}`,
                            subtitle: `£ ${sumOf(entry.data, data => data.revenue).toFixed(2)}`,
                            children: entry.data.map(data => ({
                                title: data.store + " " + data.territory,
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