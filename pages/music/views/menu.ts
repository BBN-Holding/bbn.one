import { API, Chart, count, HeavyList, LoadingSpinner, Navigation, placeholder, stupidErrorAlert } from "shared/mod.ts";
import { Button, Entry, Grid, isMobile, MediaQuery, ref } from "webgen/mod.ts";
import { DropType } from "../../../spec/music.ts";
import { activeUser } from "../../_legacy/helper.ts";
import { state } from "../state.ts";
import { musicList } from "./list.ts";

export const musicMenu = Navigation({
    title: ref`Hi ${activeUser.$username} 👋`,
    actions: [
        Button("Submit new Drop")
            .onPromiseClick(async () => {
                const { id } = await API.music.drops.create().then(stupidErrorAlert);
                location.href = `/c/music/new-drop?id=${id}`;
            })
    ],
    categories: [
        {
            id: "published",
            title: ref`Published ${count(state.$published)}`,
            // TODO: Use HeavyList
            children: state.$published.map(published => published == "loading" ? [ LoadingSpinner() ] : [
                musicList(published ?? [], DropType.Published)
            ])
        },
        {
            id: "unpublished",
            title: ref`Unpublished ${count(state.$unpublished)}`,
            // TODO: Use HeavyList
            children: state.$unpublished.map(unpublished => unpublished == "loading" ? [ LoadingSpinner() ] : [
                musicList(unpublished ?? [], DropType.Private)
            ])
        },
        {
            id: "drafts",
            title: ref`Drafts ${count(state.$drafts)}`,
            // TODO: Use HeavyList
            children: state.$drafts.map(drafts => drafts == "loading" ? [ LoadingSpinner() ] : [
                musicList(drafts ?? [], DropType.Unsubmitted)
            ])
        },
        {
            id: "payouts",
            title: ref`Payouts ${count(state.$payouts)}`,
            children: state.$payouts.map(payouts => payouts == "loading" ? [ LoadingSpinner() ] : [
                MediaQuery("(max-width: 700px)", (small) =>
                    Grid(
                        Chart({
                            type: 'bar',
                            data: {
                                labels: payouts.map(row => row.period.split(" to ")[ 0 ].split("Period ")[ 1 ].split("-").slice(0, 2).join("-")).reverse(),
                                datasets: [
                                    {
                                        label: 'Revenue by Month',
                                        data: payouts.map(row => row.moneythisperiod.replace("£ ", "")).reverse(),
                                    }
                                ]
                            },
                            options: {
                                plugins: {
                                    title: {
                                        display: true,
                                        text: 'Revenue by Month',
                                        color: 'white'
                                    },
                                    legend: {
                                        display: false
                                    }
                                },
                                responsive: true,
                                scales: {
                                    x: {
                                        stacked: true,
                                    },
                                    y: {
                                        stacked: true
                                    }
                                }
                            }
                        }),
                        Chart({
                            type: 'bar',
                            data: {
                                labels: payouts.map(row => row.period.split(" to ")[ 0 ].split("Period ")[ 1 ].split("-").slice(0, 2).join("-")).reverse(),
                                datasets: [
                                    {
                                        label: 'Streams by Month',
                                        data: payouts.map(row => row.streams).reverse()
                                    }
                                ]
                            },
                            options: {
                                plugins: {
                                    title: {
                                        display: true,
                                        text: 'Streams by Month',
                                        color: 'white'
                                    },
                                    legend: {
                                        display: false
                                    }
                                },
                                responsive: true,
                                scales: {
                                    x: {
                                        stacked: true,
                                    },
                                    y: {
                                        stacked: true
                                    }
                                }
                            }
                        })
                    ).setEvenColumns(small ? 1 : 2)
                ),
                HeavyList(state.$payouts, (x) => Entry({
                    title: x.period,
                    subtitle: x.moneythisperiod,
                }).onClick(() => {
                    location.href = `/c/music/payout?id=${x._id}`;
                })).setPlaceholder(placeholder("No Payouts", "Release new Drops to earn money"))
            ])
        }
    ]
})
    .addClass(
        isMobile.map(mobile => mobile ? "mobile-navigation" : "navigation"),
        "limited-width"
    );

state.$drafts.listen(drafts =>
    musicMenu.path.setValue((drafts?.length ?? 0) > 0 ? "drafts/" : "published/")
);