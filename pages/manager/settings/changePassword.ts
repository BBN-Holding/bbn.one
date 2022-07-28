import { Grid, Input, Page, PlainText, Vertical, Wizard, WizardComponent } from "webgen/mod.ts";
import { Redirect, syncFromData } from "../helper.ts";
import { ActionBar } from "../misc/actionbar.ts";
import { API } from "../RESTSpec.ts";
import { delay } from "https://deno.land/std@0.149.0/async/mod.ts";
import { returnFunction, ViewState } from "./helper.ts";

export function ChangePassword(update: (data: Partial<ViewState>) => void): WizardComponent {
    return Wizard({
        cancelAction: () => { },
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
            }, returnFunction(update)),
            PlainText("")
                .addClass("error-message", "limited-width")
                .setId("error-message-area"),
            Vertical(
                Grid(
                    [
                        { width: 2 },
                        Vertical(
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
            [ "new-password" ]: v.string({ invalid_type_error: "New password is missing" }).min(1),
            [ "verify-new-password" ]: v.string({ invalid_type_error: "Verify New password is missing" }).min(1)
        })
            .refine(val => val[ "new-password" ] == val[ "verify-new-password" ], "Your new password didn't match")
        )
    ]);
}
