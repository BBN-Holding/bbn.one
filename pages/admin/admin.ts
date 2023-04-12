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

if (!API.permission.isReviewer(IsLoggedIn())) {
    location.href = "/";
} else {
    WebGen({
        icon: new MaterialIcons(),
        events: {
            themeChanged: changeThemeColor()
        }
    });
    Redirect();
    await RegisterAuthRefresh();
    const view: ViewClass<ViewState> = View<ViewState>(({ state, update }) => Vertical(
        ActionBar(`Hi ${IsLoggedIn()?.profile.username}! 👋`, [
            {
                title: `Reviews (${state.reviews?.length})`,
                selected: state.type == "reviews",
                onclick: () => update({ type: "reviews" }),
            },
            {
                title: `Users (${state.users?.length})`,
                selected: state.type == "users",
                hide: !state.users,
                onclick: () => update({ type: "users" }),
            }
        ],
            // {
            //     title: "Submit new Drop",
            //     onclick: async () => {
            //         const id = await API.music(API.getToken()).post();
            //         location.href = `/music/new-drop?id=${id}`;
            //     }
            // }
        ),
        Box((() => {
            if (state.reviews && state.reviews.length != 0 && state.type == "reviews")
                return ReviewPanel(() => view, state);
            if (state.users && state.users.length != 0 && state.type == "users")
                return UserPanel(() => view, state);
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
}