import { count, LoadingSpinner, Menu } from "shared";
import { Color, Reactive, ref, refMap } from "webgen/mod.ts";
import { activeUser } from "../../manager/helper.ts";
import { state } from "../data.ts";
import { detailsView } from "../views/details.ts";
import { listView } from "../views/list.ts";
import { storeView } from "../views/store.ts";

export const hostingMenu = Menu({
    title: ref`Hi ${activeUser.$username} 👋`,
    id: "/",
    categories: {
        "servers/": {
            title: ref`Servers ${count(state.$servers)}`,
            custom: () => Reactive(state, "servers", () =>
                listView(state.servers ?? [])
            )
        },
        "details/": {
            title: "Details",
            custom: () => Reactive(state, "meta", () =>
                state.meta ? detailsView() : LoadingSpinner()
            )
        },
        "store/": {
            title: "Store",
            custom: () => Reactive(state, "meta", () =>
                storeView
            )
        }
    },
    menuBarAction: {
        title: "Start new Server",
        color: refMap(state.$meta, () => !state.meta || (state.meta.used.slots >= state.meta.limits.slots) ? Color.Disabled : Color.Grayscaled),
        onclick: () => {
            location.href = "/hosting/create";
        }
    },
    custom: () => LoadingSpinner()
})
    .setActivePath(refMap(state.$loaded, loaded => loaded ? (state.servers.length == 0 ? '/details/' : '/servers/') : '/'));