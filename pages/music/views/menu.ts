import { API, count, LoadingSpinner, Navigation } from "shared";
import { Button, isMobile, ref, Vertical } from "webgen/mod.ts";
import { DropType } from "../../../spec/music.ts";
import { activeUser } from "../../_legacy/helper.ts";
import { state } from "../state.ts";
import { listPayouts, musicList } from "./list.ts";

export const musicMenu = Navigation({
    title: ref`Hi ${activeUser.$username} 👋`,
    actions: [
        Button("Submit new Drop")
            .onPromiseClick(async () => {
                const id = await API.music.drops.create();
                location.href = `/music/new-drop?id=${id}`;
            })
    ],
    categories: [
        {
            id: "published",
            title: ref`Published ${count(state.$published)}`,
            // TODO: Use HeavyList
            children: state.$published.map(lo => lo ? [
                musicList(state.published ?? [], DropType.Published)
            ] : [ LoadingSpinner() ])
        },
        {
            id: "unpublished",
            title: ref`Unpublished ${count(state.$unpublished)}`,
            // TODO: Use HeavyList
            children: state.$unpublished.map(lo => lo ? [
                musicList(state.unpublished ?? [], DropType.Private)
            ] : [ LoadingSpinner() ])
        },
        {
            id: "drafts",
            title: ref`Drafts ${count(state.$drafts)}`,
            // TODO: Use HeavyList
            children: state.$drafts.map(lo => lo ? [
                musicList(state.drafts ?? [], DropType.Unsubmitted)
            ] : [ LoadingSpinner() ])
        },
        {
            id: "payouts",
            title: ref`Payouts ${count(state.$payouts)}`,
            // TODO: Use HeavyList
            children: state.$payouts.map(lo => lo ? [
                Vertical(listPayouts(state.payouts ?? []))
                    .setGap("0.5rem")
            ] : [ LoadingSpinner() ])
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