import { Grid, TextInput, Page, Vertical, Wizard, WizardComponent } from "webgen/mod.ts";
import { Redirect } from "../helper.ts";
import { ActionBar } from "../misc/actionbar.ts";
import { API } from "../RESTSpec.ts";
import { delay } from "https://deno.land/std@0.185.0/async/mod.ts";
import { returnFunction, ViewState } from "./helper.ts";
import { HandleSubmit, setErrorMessage } from "../misc/common.ts";

export function ChangePassword(update: (data: Partial<ViewState>) => void): WizardComponent {
    return Wizard({
        submitAction: async ([ { data: { data } } ]) => {
            await API.user(API.getToken()).setMe.post({
                password: data.newPassword
            });
            await delay(300);
            localStorage.clear();
            Redirect();
        },
        buttonArrangement: ({ PageValid, Submit }) => {
            setErrorMessage();
            return ActionBar("Change Password", undefined, {
                title: "Change", onclick: HandleSubmit(PageValid, Submit)
            }, returnFunction(update));
        },
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