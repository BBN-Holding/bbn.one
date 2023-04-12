import { WebGen, MaterialIcons, Box, Custom, Vertical, View, ViewClass, loadingWheel } from "webgen/mod.ts";
import { IsLoggedIn, Redirect, RegisterAuthRefresh, renewAccessTokenIfNeeded } from "../manager/helper.ts";
import { changeThemeColor } from "../manager/misc/common.ts";
import { DynaNavigation } from "../../components/nav.ts";
import { API } from "../manager/RESTSpec.ts";
import { ActionBar } from "../manager/misc/actionbar.ts";
import { ViewState } from "../admin/types.ts";
import { ReviewPanel } from "./reviews.ts";

import '../../assets/css/main.css';
import '../../assets/css/admin.css';
import { loadReviews, loadUsers } from "./helper.ts";
import { UserPanel } from "./users.ts";
Redirect();
await RegisterAuthRefresh();

if (!API.permission.isReviewer(IsLoggedIn())) {
    location.href = "/";
}

WebGen({
    icon: new MaterialIcons(),
    events: {
        themeChanged: changeThemeColor()
    }
});

const view: ViewClass<ViewState> = View<ViewState>(({ state, update }) => Vertical(
    ActionBar(`Hi ${IsLoggedIn()?.profile.username}! 👋`, [
        {
            title: `Reviews ${getListCount(state.reviews)}`,
            selected: state.type == "reviews",
            onclick: () => update({ type: "reviews" }),
        },
        {
            title: `Users ${getListCount(state.users)}`,
            selected: state.type == "users",
            hide: !state.users,
            onclick: () => update({ type: "users" }),
        }
    ]),
    Box((() => {
        if (state.reviews && state.reviews.length != 0 && state.type == "reviews")
            return ReviewPanel(() => view, state);
        if (state.users && state.users.length != 0 && state.type == "users")
            return UserPanel(state);
        return Custom(loadingWheel() as Element as HTMLElement);
    })()).addClass("loading"),
))
    .change(({ update }) => {
        update({ type: "reviews" });
    });

View(() => Vertical(...DynaNavigation("Admin"), view.asComponent())).appendOn(document.body);
renewAccessTokenIfNeeded().then(() => {
    loadReviews(view);
    loadUsers(view);
});


// deno-lint-ignore no-explicit-any
function getListCount(list?: any[]) {
    if (typeof list?.length == "number") return `(${list.length})`;
    return "";
}
