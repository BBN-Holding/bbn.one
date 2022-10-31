import { Box, Color, Custom, Grid, IconButton, img, Input, Page, PlainText, Vertical, View, Wizard, WizardComponent } from "webgen/mod.ts";
import { allowedImageFormats, forceRefreshToken, GetCachedProfileData, syncFromData } from "../helper.ts";
import { ActionBar } from "../misc/actionbar.ts";
import { API } from "../RESTSpec.ts";
import { delay } from "https://deno.land/std@0.149.0/async/mod.ts";
import { returnFunction, ViewState } from "./helper.ts";
import { StreamingUploadHandler, uploadFilesDialog } from "../upload.ts";
import { Validate } from "../misc/common.ts";

export function ChangePersonal(update: (data: Partial<ViewState>) => void): WizardComponent {
    return Wizard({
        cancelAction: () => { },
        submitAction: () => { },
    }, ({ PageValid }) => [
        Page((data) => [
            ActionBar("Personal", undefined, {
                title: "Update", onclick: () => {
                    Validate(PageValid, async () => {
                        await API.user(API.getToken()).setMe.post({
                            name: data.get("name")?.toString()
                        });
                        await delay(300);
                        await forceRefreshToken();
                    });
                }
            }, returnFunction(update)),
            PlainText("")
                .addClass("error-message", "limited-width")
                .setId("error-message-area"),
            Vertical(
                Grid(
                    // IDEA: Move this to a ImageUploadInput with Animations
                    View<{ path: string; }>(({ state, update }) => Box(
                        Custom(img(state.path)).addClass("upload-image"),
                        IconButton("edit")
                    )
                        .addClass("image-edit")
                        .onClick(() => uploadFilesDialog(([ file ]) => {
                            update({ path: URL.createObjectURL(file) });
                            setTimeout(() => {
                                const image = document.querySelector(".upload-image")!;
                                StreamingUploadHandler(`user/upload`, {
                                    uploadDone: () => {
                                        const animation = image.animate([
                                            { filter: "grayscale(1) blur(23px)", transform: "scale(0.6)" },
                                            { filter: "grayscale(0) blur(0px)", transform: "scale(1)" },
                                        ], { duration: 100, fill: 'forwards' });
                                        animation.currentTime = 0;
                                        animation.pause();
                                    },
                                    prepare: () => {
                                        data.set("loading", "-");
                                    },
                                    backendResponse: async () => {
                                        await forceRefreshToken();
                                        update({ path: GetCachedProfileData().profile.avatar });
                                        data.delete("loading");
                                    },
                                    credentials: () => API.getToken(),
                                    onUploadTick: async (percentage) => {
                                        const animation = image.animate([
                                            { filter: "grayscale(1) blur(23px)", transform: "scale(0.6)" },
                                            { filter: "grayscale(0) blur(0px)", transform: "scale(1)" },
                                        ], { duration: 100, fill: 'forwards' });
                                        animation.currentTime = percentage;
                                        animation.pause();
                                        await delay(5);
                                    }
                                }, file);
                            });
                        }, allowedImageFormats.join(","))))
                        .change(({ update }) => update({ path: GetCachedProfileData().profile.avatar }))
                        .asComponent(),
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
            email: GetCachedProfileData().profile.email,
            name: GetCachedProfileData().profile.username,
        })
    ]);
}
