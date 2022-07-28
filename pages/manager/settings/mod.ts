import { Box, Color, Custom, Grid, IconButton, img, Input, MaterialIcons, Page, PageComponent, PlainText, Vertical, View, WebGen, Wizard } from "webgen/mod.ts";
import { GetCachedProfileData, Redirect, RegisterAuthRefresh, syncFromData } from "../helper.ts";
import '../../../assets/css/main.css';
import { changeThemeColor } from "../misc/common.ts";
import { DynaNavigation } from "../../../components/nav.ts";
import { ActionBar } from "../misc/actionbar.ts";
import { Entry } from "./Entry.ts";
import { ZodObject, ZodType } from "https://deno.land/x/zod@v3.16.0/types.ts";
import { API } from "../RESTSpec.ts";
import { delay } from "https://deno.land/std@0.149.0/async/mod.ts";
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
const wizard = Wizard({
    cancelAction: () => {

    },
    submitAction: () => { },
}, ({ PageValid }) => [
    Page((data) => [
        ActionBar("Change Password", undefined, {
            title: "Change", onclick: async () => {
                const newLocal = PageValid();
                if (newLocal === true) {
                    document.querySelector<HTMLElement>("#error-message-area")!.innerText = "";
                    await API.user(API.getToken()).setMe.post({
                        password: data.get("new-password")?.toString()
                    });
                    await delay(300);
                    localStorage.clear();
                    Redirect();
                } else {
                    document.querySelector<HTMLElement>("#error-message-area")!.innerText = newLocal.error.errors.map(x => x.message).join("\n");
                }
            }
        }, returnFunction()),
        PlainText("")
            .addClass("error-message", "limited-width")
            .setId("error-message-area"),
        Vertical(
            Grid(
                [
                    { width: 2 },
                    Vertical(
                        // Input({
                        //     placeholder: "Current Password",
                        //     ...syncFromData(data, "current")
                        // }),
                        Input({
                            placeholder: "New Password",
                            ...syncFromData(data, "new-password")
                        }),
                        Input({
                            placeholder: "Verify New Password",
                            ...syncFromData(data, "verify-new-password")
                        })
                    ).setGap("20px")
                ]
            )
                .setDynamicColumns(1, "12rem")
                .addClass("settings-form")
                .setGap("15px")
        ).setGap("20px"),
    ]).addValidator((v) => v.object({
        // current: v.string({ invalid_type_error: "Current password is missing" }).min(1),
        [ "new-password" ]: v.string({ invalid_type_error: "New password is missing" }).min(1),
        [ "verify-new-password" ]: v.string({ invalid_type_error: "Verify New password is missing" }).min(1)
    })
        // .refine((val) => val.current != val[ "new-password" ], "Your new password is still the same")
        .refine(val => val[ "new-password" ] == val[ "verify-new-password" ], "Your new password didn't match")
    )
]);
const mainview = View<ViewState>(({ state, update }) => Vertical(
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
            wizard
        ],
        "change-personal": [
            ActionBar("Personal", undefined, { title: "Update", onclick: () => { } }, returnFunction()),
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


function returnFunction() {
    return [ { title: "Settings", onclick: () => mainview.viewOptions().update({ mode: "landing-page" }) } ];
}
