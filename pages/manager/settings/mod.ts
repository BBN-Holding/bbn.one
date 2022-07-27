import { MaterialIcons, Vertical, View, WebGen } from "webgen/mod.ts";
import { Redirect, RegisterAuthRefresh } from "../helper.ts";
import '../../../assets/css/main.css';
import { changeThemeColor } from "../misc/common.ts";
import { DynaNavigation } from "../../../components/nav.ts";
import { ActionBar } from "../misc/actionbar.ts";
import { Entry } from "./Entry.ts";
WebGen({
    icon: new MaterialIcons(),
    events: {
        themeChanged: changeThemeColor()
    }
});
Redirect();
RegisterAuthRefresh();

type ViewState = {
    mode: "change-password" | "landing-page" | "change-personal";
};

View<ViewState>(({ state, update }) => Vertical(
    ...DynaNavigation("Settings"),

    ...{
        "landing-page": [
            ActionBar("Settings", undefined, undefined),
            Vertical(
                Entry("Personal", "Username, Email, Profile Picture...", () => {
                    update({ mode: "change-personal" });
                }),
                localStorage.type != "email" ? null :
                    Entry("Change Password", undefined, () => {
                        update({ mode: "change-password" });
                    }),
                Entry("Logout", undefined, () => {
                    localStorage.clear();
                    Redirect();
                }),
            ).setGap("20px")
        ],
        "change-password": [
            ActionBar("Change Password", undefined, undefined, returnFunction(update)),
            Vertical(

            ).setGap("20px")
        ],
        "change-personal": [
            ActionBar("Personal", undefined, undefined, returnFunction(update)),
            Vertical(

            ).setGap("20px")
        ]
    }[ state.mode ?? "landing-page" ]

))
    .appendOn(document.body);


function returnFunction(update: (data: Partial<ViewState>) => void): { title: string; onclick: () => void | Promise<void>; }[] {
    return [ { title: "Settings", onclick: () => update({ mode: "landing-page" }) } ];
}
