import { MaterialIcons, Vertical, View, WebGen } from "webgen/mod.ts";
import { Redirect, RegisterAuthRefresh, activeUser } from "../manager/helper.ts";
import { ActionBar } from "../manager/misc/actionbar.ts";
import { detailsView } from "./features/details.ts";
import { storeView } from "./features/store.ts";
import { serverView } from "./features/server.ts";
import { DynaNavigation } from "../../components/nav.ts";
import '../../assets/css/main.css';
import '../../assets/css/hosting.css';
WebGen({
    icon: new MaterialIcons()
});
Redirect();
await RegisterAuthRefresh();

type ViewState = {
    type: "Servers" | "Details" | "Store";
};

const view = View<ViewState>(({ state, update }) => Vertical(
    ActionBar(`Hi ${activeUser.username}! 👋`, [
        {
            title: `Servers`,
            selected: state.type == "Servers",
            onclick: () => update({ type: "Servers" })
        },
        {
            title: `Details`,
            selected: state.type == "Details",
            onclick: () => update({ type: "Details" })
        },
        {
            title: `Store`,
            selected: state.type == "Store",
            onclick: () => update({ type: "Store" })
        }
    ], {
        title: "Start new Server",
        onclick: () => {
            location.href += "/create";
        }
    }),
    {
        Details: detailsView,
        Store: storeView,
        Servers: serverView
    }[ state.type ?? "Servers" ]
).setGap("20px"))
    .change(({ update }) => {
        update({ type: "Servers" });
    });

View(() => Vertical(
    ...DynaNavigation("Hosting"),
    view.asComponent()
)).appendOn(document.body);