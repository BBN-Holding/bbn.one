import { activeUser } from "shared/helper.ts";
import { API, Chart, count, placeholder, stupidErrorAlert } from "shared/mod.ts";
import { asRef, asRefRecord, Component, Entry, Grid, isMobile, ref } from "webgen/mod.ts";
import { Artist, Drop, DropType, Payout } from "../../../spec/music.ts";
import { ArtistEntry, DropEntry, musicList } from "./list.ts";
import { createArtistSheet } from "./table.ts";

export const menuState = asRefRecord({
    published: <Drop[] | "loading"> "loading",
    unpublished: <Drop[] | "loading"> "loading",
    drafts: <Drop[] | "loading"> "loading",
    payouts: <Payout[] | "loading"> "loading",
    artists: <Artist[] | "loading"> "loading",
});

const menuButtons = asRef(<Component[]> []);

export const musicMenu = Navigation({
    title: ref`Hi ${activeUser.$username} 👋`,
    actions: menuButtons,
    categories: [
        {
            id: "published",
            title: ref`Published ${count(menuState.$published)}`,
            // TODO: Use HeavyList
            children: menuState.$published.map((published) =>
                published == "loading" ? [LoadingSpinner()] : [
                    musicList(published ?? [], DropType.Published),
                ]
            ),
        },
        {
            id: "unpublished",
            title: ref`Unpublished ${count(menuState.$unpublished)}`,
            children: [
                HeavyList(menuState.$unpublished, (x) => DropEntry(x))
                    .setPadding("var(--gap) 0 0 0")
                    .setPlaceholder(placeholder("No Unpublished Drops", "Create a new Drop to release music")),
            ],
        },
        {
            id: "drafts",
            title: ref`Drafts ${count(menuState.$drafts)}`,
            // TODO: Use HeavyList
            children: menuState.$drafts.map((drafts) =>
                drafts == "loading" ? [LoadingSpinner()] : [
                    musicList(drafts ?? [], DropType.Unsubmitted),
                ]
            ),
        },
        {
            id: "artists",
            title: ref`Artists ${count(menuState.$artists)}`,
            children: [
                HeavyList(menuState.$artists, (x) => ArtistEntry(x))
                    .setPadding("var(--gap) 0 0 0")
                    .setPlaceholder(placeholder("No Artists", "Create a new Artist to release music")),
            ],
        },
        {
            id: "payouts",
            title: ref`Payouts ${count(menuState.$payouts)}`,
            children: menuState.$payouts.map((payouts) =>
                payouts == "loading" ? [LoadingSpinner()] : [
                    isMobile.map((mobile) =>
                        Grid(
                            Chart({
                                type: "bar",
                                data: {
                                    labels: payouts.map((row) => row.period.split(" to ")[0].split("Period ")[1].split("-").slice(0, 2).join("-")).reverse(),
                                    datasets: [
                                        {
                                            label: "Revenue by Month",
                                            data: payouts.map((row) => row.moneythisperiod.replace("£ ", "")).reverse(),
                                        },
                                    ],
                                },
                                options: {
                                    plugins: {
                                        title: {
                                            display: true,
                                            text: "Revenue by Month",
                                            color: "white",
                                        },
                                        legend: {
                                            display: false,
                                        },
                                    },
                                    responsive: true,
                                    scales: {
                                        x: {
                                            stacked: true,
                                        },
                                        y: {
                                            stacked: true,
                                        },
                                    },
                                },
                            }),
                            Chart({
                                type: "bar",
                                data: {
                                    labels: payouts.map((row) => row.period.split(" to ")[0].split("Period ")[1].split("-").slice(0, 2).join("-")).reverse(),
                                    datasets: [
                                        {
                                            label: "Streams by Month",
                                            data: payouts.map((row) => row.streams).reverse(),
                                        },
                                    ],
                                },
                                options: {
                                    plugins: {
                                        title: {
                                            display: true,
                                            text: "Streams by Month",
                                            color: "white",
                                        },
                                        legend: {
                                            display: false,
                                        },
                                    },
                                    responsive: true,
                                    scales: {
                                        x: {
                                            stacked: true,
                                        },
                                        y: {
                                            stacked: true,
                                        },
                                    },
                                },
                            }),
                        ).setEvenColumns(mobile ? 1 : 2)
                    ).asRefComponent(),
                    HeavyList(menuState.$payouts, (x) =>
                        Entry({
                            title: x.period,
                            subtitle: x.moneythisperiod,
                        }).onClick(() => {
                            location.href = `/c/music/payout?id=${x._id}`;
                        })).setPlaceholder(placeholder("No Payouts", "Release new Drops to earn money")),
                ]
            ),
        },
    ],
})
    .addClass(
        isMobile.map((mobile) => mobile ? "mobile-navigation" : "navigation"),
        "limited-width",
    );

musicMenu.path.listen((path) => {
    if (path === "artists/") {
        menuButtons.setValue(
            [
                Button("Create new Artist")
                    .onClick(() => createArtistSheet().then(async () => menuState.artists = await API.music.artists.list().then(stupidErrorAlert))),
            ],
        );
    } else {
        menuButtons.setValue([
            Button("Create new Drop")
                .onPromiseClick(async () => {
                    const { id } = await API.music.drops.create().then(stupidErrorAlert);
                    location.href = `/c/music/new-drop?id=${id}`;
                }),
        ]);
    }
});

menuState.$drafts.listen((drafts) => musicMenu.path.setValue((drafts?.length ?? 0) > 0 ? "drafts/" : "published/"));
