import { Box, Color, Grid, IconButton, TextInput, Page, PlainText, Vertical, Wizard, WizardComponent, Reactive, Image, AdvancedImage } from "webgen/mod.ts";
import { activeUser, allowedImageFormats, forceRefreshToken } from "../helper.ts";
import { ActionBar } from "../misc/actionbar.ts";
import { API } from "../RESTSpec.ts";
import { delay } from "https://deno.land/std@0.185.0/async/mod.ts";
import { returnFunction, ViewState } from "./helper.ts";
import { StreamingUploadHandler, uploadFilesDialog } from "../upload.ts";
import { HandleSubmit, setErrorMessage } from "../misc/common.ts";

export function ChangePersonal(update: (data: Partial<ViewState>) => void): WizardComponent {
    return Wizard({
        submitAction: async ([ { data: { data } } ]) => {
            await API.user(API.getToken()).setMe.post(data);
            await delay(300);
            await forceRefreshToken();
        },
        buttonArrangement: ({ PageValid, Submit }) => {
            setErrorMessage();
            return ActionBar("Personal", undefined, {
                title: "Update", onclick: HandleSubmit(PageValid, Submit)
            }, returnFunction(update));
        },
        buttonAlignment: "top",
    }, () => [
        Page({
            email: activeUser.email,
            name: activeUser.username,
            loading: false,
            profilePicture: activeUser.avatar ?? <AdvancedImage | string>{ type: "loading" } as string | AdvancedImage | undefined
        }, (data) => [
            Vertical(
                Grid(
                    Reactive(data, "profilePicture", () => Box(Image(data.profilePicture ?? { type: "loading" }, "Your Avatarimage"), IconButton("edit", "edit-icon")).addClass("upload-image").onClick(() => {
                        uploadFilesDialog(([ file ]) => {
                            const blobUrl = URL.createObjectURL(file);
                            data.profilePicture = <AdvancedImage>{ type: "uploading", filename: file.name, blobUrl, percentage: 0 };
                            data.loading = true;
                            setTimeout(() => {
                                StreamingUploadHandler(`user/set-me/avatar`, {
                                    failure: () => {
                                        data.loading = false;
                                        data.profilePicture = activeUser.avatar;
                                        alert("Your Upload has failed. Please try a different file or try again later");
                                    },
                                    uploadDone: () => {
                                        data.profilePicture = <AdvancedImage>{ type: "waiting-upload", filename: file.name, blobUrl };
                                    },
                                    backendResponse: async () => {
                                        await forceRefreshToken();
                                        data.profilePicture = activeUser.avatar;
                                        data.loading = false;
                                    },
                                    credentials: () => API.getToken(),
                                    onUploadTick: async (percentage) => {
                                        data.profilePicture = <AdvancedImage>{ type: "uploading", filename: file.name, blobUrl, percentage };
                                        await delay(2);
                                    }
                                }, file);
                            });
                        }, allowedImageFormats.join(","));
                    })),
                    [
                        { width: 2 },
                        Vertical(
                            TextInput("text", "Name").sync(data, "name"),
                            TextInput("email", "Email")
                                .setColor(Color.Disabled)
                                .sync(data, "email")
                                .addSuffix(PlainText("Note: Changing Email is currently not supported."))
                        ).setGap("20px")
                    ]
                )
                    .setDynamicColumns(1, "12rem")
                    .addClass("settings-form")
                    .setGap("15px")
            ).setGap("20px").addClass("limited-width"),
        ]).setValidator((v) => v.object({
            name: v.string().min(1)
        }).strip())
    ]);
}
