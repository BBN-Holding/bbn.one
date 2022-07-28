import { Box, Color, Custom, Grid, IconButton, img, Input, MaterialIcons, Vertical, View, WebGen } from "webgen/mod.ts";
import { GetCachedProfileData, Redirect, RegisterAuthRefresh } from "../helper.ts";
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
            ActionBar("Change Password", undefined, { title: "Change", onclick: () => { } }, returnFunction(update)),
            Vertical(
                Grid(
                    [
                        { width: 2 },
                        Vertical(
                            Input({
                                placeholder: "Current Password"
                            }),
                            Input({
                                placeholder: "New Password"
                            }),
                            Input({
                                placeholder: "Verify New Password"
                            })
                        ).setGap("20px")
                    ]
                )
                    .setDynamicColumns(1, "12rem")
                    .addClass("settings-form")
                    .setGap("15px")
            ).setGap("20px")
        ],
        "change-personal": [
            ActionBar("Personal", undefined, { title: "Update", onclick: () => { } }, returnFunction(update)),
            Vertical(
                Grid(
                    Box(
                        Custom(img(GetCachedProfileData().picture)),
                        IconButton("edit")
                    ).addClass("image-edit").onClick(() => alert("Unsupported")),
                    [
                        { width: 2 },
                        Vertical(
                            Input({
                                placeholder: "Name"
                            }),
                            Input({
                                placeholder: "Email"
                            })
                        ).setGap("20px")
                    ]
                )
                    .setDynamicColumns(1, "12rem")
                    .addClass("settings-form")
                    .setGap("15px")
            ).setGap("20px").addClass("limited-width")
        ]
    }[ state.mode ?? "landing-page" ]

))
    .appendOn(document.body);


function returnFunction(update: (data: Partial<ViewState>) => void): { title: string; onclick: () => void | Promise<void>; }[] {
    return [ { title: "Settings", onclick: () => update({ mode: "landing-page" }) } ];
}
