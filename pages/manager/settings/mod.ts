import { CenterV, Horizontal, Icon, IconButton, MaterialIcons, PlainText, Spacer, Vertical, View, WebGen } from "webgen/mod.ts";
import { GetCachedProfileData, Redirect, RegisterAuthRefresh } from "../helper.ts";
import '../../../assets/css/main.css';
import { changeThemeColor } from "../misc/common.ts";
import { DynaNavigation } from "../../../components/nav.ts";
import { ActionBar } from "../misc/actionbar.ts";
WebGen({
    icon: new MaterialIcons(),
    events: {
        themeChanged: changeThemeColor()
    }
});
Redirect();
RegisterAuthRefresh();

View(() => Vertical(
    ...DynaNavigation("Settings"),
    ActionBar("Settings"),
    Vertical(
        Horizontal(
            Vertical(
                PlainText("Personal")
                    .setFont(1.5, 700),
                Spacer(),
                PlainText("Username, Email, Profile Picture...")
                    .setFont(1, 700)
                    .addClass("subtitle")
            )
                .addClass("meta-data"),
            Spacer(),
            CenterV(Icon("arrow_forward_ios"))
        )
            .setPadding("18px 24px")
            .addClass("list-entry", "action", "limited-width"),
        localStorage.type == "email" ?
            Horizontal(
                CenterV(
                    PlainText("Change Password")
                        .setFont(1.5, 700),
                )
                    .addClass("meta-data"),
                Spacer(),
                CenterV(Icon("arrow_forward_ios"))
            )
                .setPadding("18px 24px")
                .addClass("list-entry", "action", "limited-width") : null,
        Horizontal(
            CenterV(
                PlainText("Logout")
                    .setFont(1.5, 700),
            )
                .addClass("meta-data"),
            Spacer(),
            CenterV(Icon("arrow_forward_ios"))
        )
            .setPadding("18px 24px")
            .addClass("list-entry", "action", "limited-width")
            .onClick(() => {
                localStorage.clear();
                Redirect();
            }),

    ).setGap("20px")
))
    .appendOn(document.body);