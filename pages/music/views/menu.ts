import { Reactive, Vertical } from "webgen/mod.ts";
import { activeUser } from "../../manager/helper.ts";
import { Menu } from "../../shared/Menu.ts";
import { state } from "../state.ts";
import { getListCount } from "../../shared/listCount.ts";
import { listPayouts, musicList } from "./list.ts";
import { DropType } from "../../../spec/music.ts";
import { LoadingSpinner } from "../../shared/components.ts";
import { API } from "../../manager/RESTSpec.ts";

export const musicMenu = () => Reactive(state, "loaded", () => Menu({
    title: activeUser.username ? `Hi ${activeUser.username} 👋` : `Hello 👋`,
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
            title: `Published ${getListCount(state.published)}`,
            custom: () => musicList(state.published ?? [], DropType.Published),
        },
        "unpublished/": {
            title: `Unpublished ${getListCount(state.unpublished)}`,
            custom: () => musicList(state.unpublished ?? [], DropType.Private),
        },
        "drafts/": {
            title: `Drafts ${getListCount(state.drafts)}`,
            custom: () => musicList(state.drafts ?? [], DropType.Unsubmitted),
        },
        "payouts/": {
            title: `Payouts ${getListCount(state.payouts)}`,
            custom: () => Reactive(state, "payouts", () =>
                Vertical(listPayouts())
                    .setGap("0.5rem")
            )
        }
    },
    custom: () => LoadingSpinner()
})
    .setActivePath(!state.loaded ? '/' : (state.drafts?.length ?? 0) > 0 ? "/drafts/" : "/published/")
);