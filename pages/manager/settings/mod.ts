import { CenterV, Horizontal, Icon, MaterialIcons, PlainText, Spacer, Vertical, View, WebGen } from "webgen/mod.ts";
import { Redirect, RegisterAuthRefresh } from "../helper.ts";
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


function returnFunction(update: (data: Partial<ViewState>) => void): { title: string; onclick: () => void | Promise<void>; }[] | undefined {
    return [ { title: "Settings", onclick: () => update({ mode: "landing-page" }) } ];
}

function Entry(text: string, subtext?: string, action?: () => void) {
    return Horizontal(
        CenterV(
            PlainText(text)
                .setFont(1.5, 700),
            ...subtext ? [
                Spacer(),
                PlainText(subtext)
                    .setFont(1, 700)
                    .addClass("subtitle")
            ] : []
        )
            .addClass("meta-data"),
        Spacer(),
        action ? CenterV(Icon("arrow_forward_ios")) : null
    )
        .onClick((() => { action?.(); }))
        .setPadding("18px 24px")
        .addClass("list-entry", action ? "action" : "no-actions", "limited-width");
}