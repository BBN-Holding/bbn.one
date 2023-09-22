import { API, count, HeavyList, LoadingSpinner, Navigation, placeholder, stupidErrorAlert } from "shared";
import { Button, Entry, isMobile, ref } from "webgen/mod.ts";
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
                location.href = `/music/new-drop?id=${id}`;
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
                HeavyList(state.$payouts, (x) => Entry({
                    title: x.period,
                    subtitle: x.moneythisperiod,
                }).onClick(() => {
                    location.href = `/music/payout?id=${x._id}`;
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