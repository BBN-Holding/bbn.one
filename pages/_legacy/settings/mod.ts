import { isMobile, Vertical, View, WebGen } from "webgen/mod.ts";
import '../../../assets/css/main.css';
import { DynaNavigation } from "../../../components/nav.ts";
import { Navigation } from "../../shared/mod.ts";
import { logOut, RegisterAuthRefresh } from "../helper.ts";
import { changeThemeColor } from "../misc/common.ts";
import { ChangePassword } from "./changePassword.ts";
import { ChangePersonal } from "./changePersonal.ts";

WebGen({
    events: {
        themeChanged: changeThemeColor()
    }
});
await RegisterAuthRefresh();

export const settingsMenu = Navigation({
    title: "Settings",
    children: [
        {
            id: "personal",
            title: "Personal",
            subtitle: "Username, Email, Profile Picture...",
            children: [
                ChangePersonal()
            ]
        },
        ...localStorage.type == "email" ? [ {
            id: "change-password",
            title: "Change Password",
            children: [
                ChangePassword()
            ]
        } ] : [],
        {
            id: "logout",
            title: "Logout",
            clickHandler: () => logOut()
        }
    ]
}).addClass(
    isMobile.map(mobile => mobile ? "mobile-navigation" : "navigation"),
    "limited-width"
);
View(() => Vertical(
    DynaNavigation("Settings"),
    settingsMenu
))
    .appendOn(document.body);