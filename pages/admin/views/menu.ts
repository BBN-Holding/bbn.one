import { debounce } from "@std/async";
import { sumOf } from "@std/collections";
import loader from "https://esm.sh/@monaco-editor/loader@1.4.0";
import { API, HeavyList, loadMore, Navigation, placeholder, stupidErrorAlert } from "shared/mod.ts";
import { asState, Box, Button, Color, Custom, Entry, Grid, Horizontal, isMobile, Label, lazy, ref, SheetDialog, Spacer, Table, TextInput, Vertical } from "webgen/mod.ts";
import { Drop, DropType, File, Server, Transcript } from "../../../spec/music.ts";
import { activeUser, ProfileData, sheetStack, showProfilePicture } from "../../_legacy/helper.ts";
import { upload } from "../loading.ts";
import { state } from "../state.ts";
import { ReviewEntry } from "./entryReview.ts";
import { GroupEntry } from "./entryUser.ts";
import { entryFile, entryOAuth, entryWallet } from "./list.ts";

const lazyMonaco = lazy(() => loader.init());

export const adminMenu = Navigation({
    title: ref`Hi ${activeUser.$username} 👋`,
    categories: [
        {
            id: "overview",
            title: `Overview`,
            children: state.$payouts.map((it) =>
                it === "loading" || it.status === "rejected"
                    ? [
                        HeavyList(state.$payouts, () => Box()),
                    ]
                    : [
                        {
                            id: "streams",
                            title: "Total Streams",
                            subtitle: it ? `${sumOf(it.value, (payouts) => sumOf(payouts, (payout) => sumOf(payout.entries, (entry) => sumOf(entry.data, (data) => data.quantity)))).toLocaleString()} Streams` : "Loading...",
                        },
                        {
                            id: "revenue",
                            title: "Calculated Revenue",
                            subtitle: it ? `£ ${sumOf(it.value, (payouts) => sumOf(payouts, (payout) => sumOf(payout.entries, (entry) => sumOf(entry.data, (data) => data.revenue)))).toFixed(2)}` : "Loading...",
                        },
                        {
                            id: "bbnmoney",
                            title: "BBN Revenue",
                            subtitle: state.$wallets.map((it) => it == "loading" ? `---` : it.status == "rejected" ? "(failed)" : `£ ${sumOf(Object.values(it.value.find((wallet) => wallet.user === "62ea6fa5321b3702e93ca21c")?.balance!), (e) => e).toFixed(2)}` ?? 0),
                        },
                    ]
            ),
        },
        {
            id: "search",
            title: ref`Search`,
            children: [
                TextInput("text", "Search").onChange(debounce(async (data) => {
                    state.search = asState([{ _index: "searching" }]);
                    const elasticresults = await API.admin.search(data ?? "").then(stupidErrorAlert);
                    state.search = asState(elasticresults.hits.hits);
                    state.searchStats = asState({ total: elasticresults.hits.total.value, took: elasticresults.took });
                }, 1000)),
                state.$searchStats.map((it) => (it === "loading" || it.status === "rejected") ? Box() : Label(`${state.$searchStats.getValue().took}ms | ${state.$searchStats.getValue().total} Entries`)).asRefComponent(),
                HeavyList(state.$search.map((it) => it as ({ _index: "transcripts"; _source: Transcript } | { _index: "drops"; _source: Drop } | { _index: "servers"; _source: Server } | { _index: "users"; _source: ProfileData } | { _index: "files"; _source: File } | { _index: "user-events"; _source: object } | { _index: "none" } | { _index: "searching" })[]), (it) => {
                    switch (it._index) {
                        case "transcripts":
                            return Entry(
                                {
                                    title: it._source.with,
                                    subtitle: it._index,
                                },
                            );
                        case "drops":
                            return ReviewEntry(it._source);
                        case "servers":
                            return Entry(
                                {
                                    title: it._source._id,
                                    subtitle: it._index,
                                },
                            );
                        case "users":
                            return Entry({
                                title: it._source.profile.username,
                                subtitle: `${it._source._id} - ${it._source.profile.email}`,
                            })
                                .addClass("small")
                                .onPromiseClick(async () => {
                                    const monaco = await lazyMonaco();
                                    const box = document.createElement("div");
                                    monaco.editor.create(box, {
                                        value: JSON.stringify(it._source, null, 2),
                                        language: "json",
                                        theme: "vs-dark",
                                        automaticLayout: true,
                                    });

                                    SheetDialog(sheetStack, "User", Custom(box).setHeight("800px").setWidth("1200px")).open();
                                })
                                .addPrefix(showProfilePicture(it._source));
                        case "files":
                            return Entry({
                                title: it._source.filename,
                                subtitle: `${it._source.length} bytes`,
                            });
                        case "user-events":
                            return Entry({
                                title: it._source.type,
                                subtitle: `${it._source.userId} - ${it._source.ip}`,
                            });
                        case "searching":
                            return placeholder("Searching", "Please wait...");
                    }
                    console.log("Unimplemented Type", it);
                    return placeholder("Unimplemented Type", "Please implement");
                })
                    .setPlaceholder(placeholder("No Results", "No results found.")),
            ],
        },
        {
            id: "drops",
            title: ref`Drops`,
            children: [
                {
                    id: "reviews",
                    title: ref`Reviews`,
                    children: [
                        HeavyList(state.drops.$reviews, (it) => ReviewEntry(it))
                            .setPlaceholder(placeholder("No Servers", "Welcome! Create a server to get going. 🤖🛠️"))
                            .enablePaging((offset, limit) => loadMore(state.drops.$reviews, () => API.admin.drops.list(DropType.UnderReview, offset, limit))),
                    ],
                },
                {
                    id: "publishing",
                    title: ref`Publishing`,
                    children: [
                        HeavyList(state.drops.$publishing, (it) => ReviewEntry(it))
                            .enablePaging((offset, limit) => loadMore(state.drops.$publishing, () => API.admin.drops.list(DropType.Publishing, offset, limit))),
                    ],
                },
            ],
        },
        {
            id: "groups",
            title: ref`Groups`,
            children: [
                HeavyList(state.$groups, (val) => GroupEntry(val))
                    .enablePaging((offset, limit) => loadMore(state.$groups, () => API.admin.groups.list(offset, limit))),
            ],
        },
        {
            id: "payouts",
            title: ref`Payout`,
            children: state.$payouts.map((payoutsdata) => [
                {
                    title: "Upload Payout File (.xlsx)",
                    id: "upload+manual",
                    clickHandler: () => {
                        upload("manual");
                    },
                },
                {
                    title: "Sync Mapping with internal Backend",
                    id: "sync",
                    clickHandler: async () => {
                        await API.admin.drops.sync();
                    },
                },
                ...payoutsdata === "loading" || payoutsdata.status === "rejected" ? [Box()] : payoutsdata.value.map((payouts) => ({
                    title: payouts[0].period,
                    id: `payouts${payouts[0].period}`,
                    subtitle: `£ ${sumOf(payouts, (payout) => sumOf(payout.entries, (entry) => sumOf(entry.data, (data) => data.revenue))).toFixed(2)}`,
                    children: payouts.map((payout) => ({
                        title: payout._id,
                        subtitle: `£ ${sumOf(payout.entries, (entry) => sumOf(entry.data, (data) => data.revenue)).toFixed(2)}`,
                        id: `payouts${payouts[0].period}${payout._id}`,
                        children: payout.entries.map((entry) => ({
                            title: entry.isrc,
                            id: `payouts${payouts[0].period}${payout._id}${entry.isrc}`,
                            subtitle: `£ ${sumOf(entry.data, (data) => data.revenue).toFixed(2)}`,
                            children: entry.data.map((data) => ({
                                title: data.store + " " + data.territory,
                                subtitle: `£ ${data.revenue.toFixed(2)}`,
                            })),
                        })),
                    })),
                })),
            ]),
        },
        {
            id: "oauth",
            title: ref`OAuth`,
            children: state.$oauth.map((it) =>
                it === "loading" || it.status === "rejected" ? [HeavyList(state.$oauth, entryOAuth)] : [
                    {
                        title: "Create new OAuth Application",
                        id: "add+oauth",
                        clickHandler: () => {
                            addOAuthDialog.open();
                        },
                    },
                    HeavyList(state.$oauth, entryOAuth),
                ]
            ),
        },
        {
            id: "files",
            title: ref`Files`,
            children: [HeavyList(state.$files, entryFile)],
        },
        {
            id: "wallets",
            title: ref`Wallets`,
            children: [
                HeavyList(state.$wallets, entryWallet)
                    .enablePaging((offset, limit) => loadMore(state.$wallets, () => API.admin.wallets.list(offset, limit))),
            ],
        },
    ],
})
    .addClass(
        isMobile.map((mobile) => mobile ? "mobile-navigation" : "navigation"),
        "limited-width",
    );

const oAuthData = asState({
    name: "",
    redirectURI: [""],
    image: "",
});

const addOAuthDialog = SheetDialog(
    sheetStack,
    "Create new OAuth Application",
    Grid(
        Label("Create new OAuth Application"),
        TextInput("text", "Name").sync(oAuthData, "name"),
        oAuthData.$redirectURI.map((x) =>
            Vertical(
                Table([
                    ["URI", "auto", (_, index) =>
                        TextInput("text", "URI", "blur")
                            .ref(asRef(x[index]))
                            .onChange((data) => {
                                x[index] = data ?? "";
                            })],
                ], x)
                    .setDelete((_, index) => {
                        oAuthData.redirectURI = asState(x.filter((_, i) => i != index));
                    }),
                Horizontal(
                    Spacer(),
                    Button("Add URI")
                        .onClick(() => {
                            x.push("");
                        }),
                ).setPadding("0 0 3rem 0"),
            )
                .setGap()
                .setWidth("clamp(0rem, 100vw, 60vw)")
                .setMargin("0 -.6rem 0 0")
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
                            oAuthData.redirectURI = asState([""]);
                            oAuthData.image = "";
                            addOAuthDialog.close();
                            state.oauth = await API.oauth.list();
                        });
                })
        ).asRefComponent(),
    ).setGap("10px"),
);
