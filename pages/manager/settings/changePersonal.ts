import { API, StreamingUploadHandler, uploadFilesDialog } from "shared";
import { delay } from "std/async/mod.ts";
import { AdvancedImage, Box, Color, Grid, IconButton, Image, Page, PlainText, Reactive, TextInput, Vertical, Wizard } from "webgen/mod.ts";
import { activeUser, allowedImageFormats, forceRefreshToken, track } from "../helper.ts";

export function ChangePersonal() {
    return Wizard({
        submitAction: async ([ { data: { data } } ]) => {
            await API.user(API.getToken()).setMe.post(data);
            await delay(300);
            await forceRefreshToken();
        },
        buttonArrangement: "flex-end",
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
                                StreamingUploadHandler(`user/set-me/avatar/upload`, {
                                    failure: () => {
                                        data.loading = false;
                                        data.profilePicture = activeUser.avatar;
                                        track({
                                            "event": "profile-picture-upload-failed",
                                        });
                                        alert("Your Upload has failed. Please try a different file or try again later");
                                    },
                                    uploadDone: () => {
                                        track({
                                            "event": "profile-picture-uploaded",
                                        });
                                        data.profilePicture = <AdvancedImage>{ type: "waiting-upload", filename: file.name, blobUrl };
                                    },
                                    backendResponse: () => {
                                        data.loading = false;
                                        data.profilePicture = <AdvancedImage>{ type: "direct", source: async () => await file };
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
