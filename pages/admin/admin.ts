import { WebGen, MaterialIcons, Box, Custom, Vertical, View, ViewClass, loadingWheel } from "webgen/mod.ts";
import { Redirect, RegisterAuthRefresh, activeUser, permCheck, renewAccessTokenIfNeeded } from "../manager/helper.ts";
import { changeThemeColor } from "../manager/misc/common.ts";
import { DynaNavigation } from "../../components/nav.ts";
import { ActionBar } from "../manager/misc/actionbar.ts";
import { ViewState } from "../admin/types.ts";
import { ReviewPanel } from "./reviews.ts";

import '../../assets/css/main.css';
import '../../assets/css/admin.css';
import { loadPayouts, loadReviews, loadUsers } from "./helper.ts";
import { UserPanel } from "./users.ts";
import { PayoutPanel } from "./payouts.ts";
import { OverviewPanel } from "./overview.ts";
import { getListCount } from "../shared/listCount.ts";
Redirect();
await RegisterAuthRefresh();

if (!permCheck(
    "/hmsys/user/manage",
    "/bbn/manage"
)) {
    location.href = "/";
}

WebGen({
    icon: new MaterialIcons(),
    events: {
        themeChanged: changeThemeColor()
    }
});

const view: ViewClass<ViewState> = View<ViewState>(({ state, update }) => Vertical(
    ActionBar(`Hi ${activeUser.username}! 👋`, [
        {
            title: "Overview",
            selected: state.type == "overview",
            onclick: () => update({ type: "overview" }),
        },
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
        },
        {
            title: `Payouts (${state.payouts?.length})`,
            selected: state.type == "payouts",
            hide: !state.payouts,
            onclick: () => update({ type: "payouts" }),
        }
    ]),
    Box((() => {
        if (state.reviews && state.reviews.length != 0 && state.type == "reviews")
            return ReviewPanel(() => view, state);
        if (state.users && state.users.length != 0 && state.type == "users")
            return UserPanel(state);
        if (state.type == "payouts")
            return PayoutPanel(state);
        if (state.type == "overview")
            return OverviewPanel(state);
        return Custom(loadingWheel() as Element as HTMLElement);
    })()).addClass("loading"),
))
    .change(({ update }) => {
        update({ type: "overview" });
    });

View(() => Vertical(...DynaNavigation("Admin"), view.asComponent())).appendOn(document.body);
renewAccessTokenIfNeeded().then(() => {
    loadReviews(view);
    loadUsers(view);
    loadPayouts(view);
});