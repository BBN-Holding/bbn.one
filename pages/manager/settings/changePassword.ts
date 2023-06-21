import { API } from "shared";
import { delay } from "std/async/mod.ts";
import { Grid, Page, TextInput, Vertical, Wizard } from "webgen/mod.ts";
import { logOut, track } from "../helper.ts";

export function ChangePassword() {
    return Wizard({
        submitAction: async ([ { data: { data } } ]) => {
            await API.user(API.getToken()).setMe.post({
                password: data.newPassword
            });
            track({
                "event": "change-password"
            });
            await delay(300);
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
                Grid(
                    [
                        { width: 2 },
                        Vertical(
                            TextInput("password", "New Password").sync(data, "newPassword"),
                            TextInput("password", "Verify New Password").sync(data, "verifyNewPassword")
                        ).setGap("20px")
                    ]
                )
                    .setDynamicColumns(1, "12rem")
                    .addClass("settings-form")
                    .setGap("15px")
            ).setGap("20px"),
        ]).setValidator((v) => v.object({
            newPassword: v.string({ invalid_type_error: "New password is missing" }).min(1),
            verifyNewPassword: v.string({ invalid_type_error: "Verify New password is missing" }).min(1)
        })
            .refine(val => val.newPassword == val.verifyNewPassword, "Your new password didn't match")
        )
    ]);
}