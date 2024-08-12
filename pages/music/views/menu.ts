import { API, Chart, count, HeavyList, LoadingSpinner, Navigation, placeholder, stupidErrorAlert } from "shared/mod.ts";
import { asRef, asState, Button, Component, Entry, Grid, Horizontal, Image, isMobile, LinkButton, MediaQuery, ref } from "webgen/mod.ts";
import { templateArtwork } from "../../../assets/imports.ts";
import { Artist, Drop, DropType, Payout } from "../../../spec/music.ts";
import { activeUser } from "../../shared/helper.ts";
import { musicList } from "./list.ts";
import { createArtistSheet } from "./table.ts";

export const menuState = asState({
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
            // TODO: Use HeavyList
            children: menuState.$unpublished.map((unpublished) =>
                unpublished == "loading" ? [LoadingSpinner()] : [
                    musicList(unpublished ?? [], DropType.Private),
                ]
            ),
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
                HeavyList(menuState.$artists, (x) =>
                    Entry({
                        title: x.name,
                        // TODO: Add used on x songs, x drops, maybe even streams?
                    })
                        .addSuffix(
                            Horizontal(
                                LinkButton("Spotify", "fdgdf"),
                                LinkButton("Apple Music", "fdgdf"),
                            ).setGap(),
                        )
                        .addPrefix(Image(templateArtwork, "").addClass("image-square")))
                    .setPlaceholder(placeholder("No Artists", "Create a new Artist to release music")),
            ],
        },
        {
            id: "payouts",
            title: ref`Payouts ${count(menuState.$payouts)}`,
            children: menuState.$payouts.map((payouts) =>
                payouts == "loading" ? [LoadingSpinner()] : [
                    MediaQuery("(max-width: 700px)", (small) =>
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
                        ).setEvenColumns(small ? 1 : 2)),
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
