import zod from "https://deno.land/x/zod@v3.22.4/index.ts";
import { API, Navigation } from "shared/mod.ts";
import { Body, Grid, TextInput, Vertical, WebGen, isMobile } from "webgen/mod.ts";
import '../../assets/css/main.css';
import { DynaNavigation } from "../../components/nav.ts";
import { RegisterAuthRefresh, logOut } from "../_legacy/helper.ts";
import { ChangePersonal } from "./settings.personal.ts";

WebGen({});
await RegisterAuthRefresh();

const passwordWizard = zod.object({
    newPassword: zod.string({ invalid_type_error: "New password is missing" }).min(4),
    verifyNewPassword: zod.string({ invalid_type_error: "Verify New password is missing" }).min(4)
})
    .refine(val => val.newPassword == val.verifyNewPassword, "Your new password didn't match");

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
        {
            id: "change-password",
            title: "Change Password",
            children: [
                Wizard({
                    submitAction: async ([ { data: { data } } ]) => {
                        await API.user.setMe.post({ password: data.newPassword });
                        logOut();
                    },
                    buttonArrangement: "flex-end",
                    buttonAlignment: "top",
                }, () => [
                    Page({
                        newPassword: undefined,
                        verifyNewPassword: undefined
                    }, (data) => [
                        Vertical(
                            Grid([
                                { width: 2 },
                                Vertical(
                                    TextInput("password", "New Password").sync(data, "newPassword"),
                                    TextInput("password", "Verify New Password").sync(data, "verifyNewPassword")
                                ).setGap("20px")
                            ])
                                .setDynamicColumns(1, "12rem")
                                .addClass("settings-form")
                                .setGap("15px")
                        ).setGap("20px"),
                    ]).setValidator(() => passwordWizard)
                ])
            ]
        },
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
Body(Vertical(
    DynaNavigation("Settings"),
    settingsMenu
));
