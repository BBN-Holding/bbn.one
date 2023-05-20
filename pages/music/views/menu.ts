import { Reactive, Vertical, ref, refMap } from "webgen/mod.ts";
import { activeUser } from "../../manager/helper.ts";
import { Menu } from "../../shared/Menu.ts";
import { state } from "../state.ts";
import { count } from "../../shared/listCount.ts";
import { listPayouts, musicList } from "./list.ts";
import { DropType } from "../../../spec/music.ts";
import { LoadingSpinner } from "../../shared/components.ts";
import { API } from "../../manager/RESTSpec.ts";

export const musicMenu = Menu({
    title: ref`Hi ${activeUser.$username} 👋`,
    id: "/",
    menuBarAction: {
        title: "Submit new Drop",
        onclick: async () => {
            const id = await API.music(API.getToken()).post();
            location.href = `/music/new-drop?id=${id}`;
        }
    },
    categories: {
        "published/": {
            title: ref`Published ${count(state.$published)}`,
            custom: () => musicList(state.published ?? [], DropType.Published),
        },
        "unpublished/": {
            title: ref`Unpublished ${count(state.$unpublished)}`,
            custom: () => musicList(state.unpublished ?? [], DropType.Private),
        },
        "drafts/": {
            title: ref`Drafts ${count(state.$drafts)}`,
            custom: () => musicList(state.drafts ?? [], DropType.Unsubmitted),
        },
        "payouts/": {
            title: ref`Payouts ${count(state.$payouts)}`,
            custom: () => Reactive(state, "payouts", () =>
                Vertical(listPayouts(state.payouts ?? []))
                    .setGap("0.5rem")
            )
        }
    },
    custom: () => LoadingSpinner()
})
    .setActivePath(refMap(state.$loaded, loaded => loaded
        ? ((state.drafts?.length ?? 0) > 0 ? "/drafts/" : "/published/")
        : "/"
    ));