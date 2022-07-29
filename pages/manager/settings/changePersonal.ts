import { Box, Color, Custom, Grid, img, Input, Page, PlainText, Vertical, Wizard, WizardComponent } from "webgen/mod.ts";
import { forceRefreshToken, GetCachedProfileData, syncFromData } from "../helper.ts";
import { ActionBar } from "../misc/actionbar.ts";
import { API } from "../RESTSpec.ts";
import { delay } from "https://deno.land/std@0.149.0/async/mod.ts";
import { returnFunction, ViewState } from "./helper.ts";

export function ChangePersonal(update: (data: Partial<ViewState>) => void): WizardComponent {
    return Wizard({
        cancelAction: () => { },
        submitAction: () => { },
    }, ({ PageValid }) => [
        Page((data) => [
            ActionBar("Personal", undefined, {
                title: "Update", onclick: async () => {
                    const newLocal = PageValid();
                    if (newLocal === true) {
                        document.querySelector<HTMLElement>("#error-message-area")!.innerText = "";
                        await API.user(API.getToken()).setMe.post({
                            name: data.get("name")?.toString()
                        });
                        await delay(300);
                        await forceRefreshToken();
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
                    Box(
                        Custom(img(GetCachedProfileData().picture)),
                        // IconButton("edit") // TODO: Waiting for Backend
                    ).addClass("image-edit").onClick(() => alert("Unsupported")),
                    [
                        { width: 2 },
                        Vertical(
                            Input({
                                placeholder: "Name",
                                ...syncFromData(data, "name")
                            }),
                            Input({
                                placeholder: "Email",
                                color: Color.Disabled,
                                ...syncFromData(data, "email")
                            }).addSuffix(PlainText("Note: Changing Email is currently not supported."))
                        ).setGap("20px")
                    ]
                )
                    .setDynamicColumns(1, "12rem")
                    .addClass("settings-form")
                    .setGap("15px")
            ).setGap("20px").addClass("limited-width"),
        ]).addValidator((v) => v.object({
            email: v.string().min(1),
            name: v.string().min(1)
        })).setDefaultValues({
            email: GetCachedProfileData().email,
            name: GetCachedProfileData().name,
        })
    ]);
}
