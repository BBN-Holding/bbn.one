import { Reactive } from "webgen/mod.ts";
import { Menu } from "../../shared/Menu.ts";
import { state } from "../data.ts";
import { activeUser } from "../../manager/helper.ts";
import { serverView } from "../views/server.ts";
import { storeView } from "../views/store.ts";
import { detailsView } from "../views/details.ts";
import { LoadingSpinner } from "../../shared/components.ts";

export const hostingMenu = () => Reactive(state, "loaded", () => Menu({
    title: `Hi ${activeUser.username} 👋`,
    id: "/",
    categories: {
        "servers/": {
            title: "Servers",
            custom: () => Reactive(state, "servers", () =>
                serverView
            )
        },
        "details/": {
            title: "Details",
            custom: () => Reactive(state, "meta", () =>
                detailsView
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
        onclick: () => {
            location.href += "/create";
        }
    },
    custom: () => LoadingSpinner()
})
    .setActivePath(!state.loaded ? '/' : '/servers/')
);