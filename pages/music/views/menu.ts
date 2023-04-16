import { Box, Custom, Reactive, loadingWheel } from "webgen/mod.ts";
import { activeUser } from "../../manager/helper.ts";
import { Menu } from "../../shared/Menu.ts";
import { state } from "../state.ts";
import { getListCount } from "../../shared/listCount.ts";
import { musicList } from "./list.ts";
import { DropType } from "../../../spec/music.ts";

export const musicMenu = () => Reactive(state, "loaded", () => Menu({
    title: activeUser.username ? `Hi ${activeUser.username} 👋` : `Hello 👋`,
    id: "/",
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
        }
    },
    custom: () => Box(Custom(loadingWheel() as Element as HTMLElement)).addClass("loading")
})
    .setActivePath(!state.loaded ? '/' : (state.drafts?.length ?? 0) > 0 ? "/drafts/" : "/published/")
);