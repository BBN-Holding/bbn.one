import { API, count, LoadingSpinner, Navigation } from "shared";
import { Button, isMobile, ref, Vertical } from "webgen/mod.ts";
import { DropType } from "../../../spec/music.ts";
import { activeUser } from "../../manager/helper.ts";
import { state } from "../state.ts";
import { listPayouts, musicList } from "./list.ts";

export const musicMenu = Navigation({
    title: ref`Hi ${activeUser.$username} 👋`,
    actions: [
        Button("Submit new Drop")
            .onPromiseClick(async () => {
                const id = await API.music(API.getToken()).drops.create();
                location.href = `/music/new-drop?id=${id}`;
            })
    ],
    categories: [
        {
            id: "published",
            title: ref`Published ${count(state.$published)}`,
            // TODO: Use HeavyList
            children: state.$published.map(lo => !lo ? [ LoadingSpinner() ] : [
                musicList(state.published ?? [], DropType.Published)
            ])
        },
        {
            id: "unpublished",
            title: ref`Unpublished ${count(state.$unpublished)}`,
            // TODO: Use HeavyList
            children: state.$unpublished.map(lo => !lo ? [ LoadingSpinner() ] : [
                musicList(state.unpublished ?? [], DropType.Private)
            ])
        },
        {
            id: "drafts",
            title: ref`Drafts ${count(state.$drafts)}`,
            // TODO: Use HeavyList
            children: state.$drafts.map(lo => !lo ? [ LoadingSpinner() ] : [
                musicList(state.drafts ?? [], DropType.Unsubmitted)
            ])
        },
        {
            id: "payouts",
            title: ref`Payouts ${count(state.$payouts)}`,
            // TODO: Use HeavyList
            children: state.$payouts.map(lo => !lo ? [ LoadingSpinner() ] : [
                Vertical(listPayouts(state.payouts ?? []))
                    .setGap("0.5rem")

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