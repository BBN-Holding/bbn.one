import { Entry, MaterialIcons, Vertical, View, WebGen } from "webgen/mod.ts";
import '../../../assets/css/main.css';
import { DynaNavigation } from "../../../components/nav.ts";
import { RegisterAuthRefresh, logOut } from "../helper.ts";
import { ActionBar } from "../misc/actionbar.ts";
import { changeThemeColor } from "../misc/common.ts";
import { ChangePassword } from "./changePassword.ts";
import { ChangePersonal } from "./changePersonal.ts";
import { ViewState } from "./helper.ts";

WebGen({
    icon: new MaterialIcons(),
    events: {
        themeChanged: changeThemeColor()
    }
});
await RegisterAuthRefresh();
View<ViewState>(({ state, update }) => Vertical(
    ...DynaNavigation("Settings"),
    ...{
        "landing-page": [
            ActionBar("Settings", undefined, undefined),
            Vertical(
                Entry({
                    title: "Personal",
                    subtitle: "Username, Email, Profile Picture...",
                }).addClass("limited-width").onClick(() => {
                    update({ mode: "change-personal" });
                }),
                localStorage.type != "email" ? null :
                    Entry({
                        title: "Change Password",
                    }).addClass("limited-width").onClick(() => {
                        update({ mode: "change-password" });
                    }),
                Entry({
                    title: "Logout"
                }).addClass("limited-width").onClick(() => {
                    logOut();
                }),
            ).setGap("20px")
        ],
        "change-password": [
            ChangePassword(update)
        ],
        "change-personal": [
            ChangePersonal(update)
        ]
    }[ state.mode ?? "landing-page" ]

))
    .appendOn(document.body);