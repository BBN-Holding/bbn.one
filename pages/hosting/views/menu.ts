import { count, LoadingSpinner, Menu } from "shared";
import { Color, Reactive, ref } from "webgen/mod.ts";
import { activeUser } from "../../manager/helper.ts";
import { state } from "../data.ts";
import { listView } from "../views/list.ts";
import { profileView } from "../views/profile.ts";

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
        "profile/": {
            title: "Profile",
            custom: () => Reactive(state, "meta", () =>
                state.meta ? profileView() : LoadingSpinner()
            )
        },
    },
    menuBarAction: {
        title: "Start new Server",
        color: state.$meta.map(() => !state.meta || (state.meta.used.slots >= state.meta.limits.slots) ? Color.Disabled : Color.Grayscaled),
        onclick: () => {
            location.href = "/hosting/create";
        }
    },
    custom: () => LoadingSpinner()
})
    .setActivePath(state.$loaded.map(loaded => loaded ? (state.servers.length == 0 ? '/profile/' : '/servers/') : '/'));