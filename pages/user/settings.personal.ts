import { API, StreamingUploadHandler, stupidErrorAlert, uploadFilesDialog } from "shared/mod.ts";
import { delay } from "std/async/mod.ts";
import { AdvancedImage, Box, Grid, IconButton, Image, MIcon, Page, TextInput, Vertical, Wizard } from "webgen/mod.ts";
import { activeUser, allowedImageFormats, forceRefreshToken } from "../_legacy/helper.ts";

export function ChangePersonal() {
    return Wizard({
        submitAction: async ([ { data: { data } } ]) => {
            await API.user.setMe.post(data)
                .then(stupidErrorAlert);
            await forceRefreshToken();
        },
        buttonArrangement: "flex-end",
        buttonAlignment: "top",
    }, () => [
        Page({
            email: activeUser.email,
            name: activeUser.username,
            loading: false,
            profilePicture: activeUser.avatar ?? { type: "loading" } as string | AdvancedImage | undefined
        }, (data) => [
            Vertical(
                Grid(
                    data.$profilePicture.map(() => Box(Image(data.profilePicture ?? { type: "loading" }, "Your Avatarimage"), IconButton(MIcon("edit"), "edit-icon")).addClass("upload-image").onClick(() => {
                        uploadFilesDialog(([ file ]) => {
                            const blobUrl = URL.createObjectURL(file);
                            data.profilePicture = <AdvancedImage>{ type: "uploading", filename: file.name, blobUrl, percentage: 0 };
                            data.loading = true;
                            setTimeout(() => {
                                StreamingUploadHandler(`user/set-me/avatar/upload`, {
                                    failure: () => {
                                        data.loading = false;
                                        data.profilePicture = activeUser.avatar;
                                        alert("Your Upload has failed. Please try a different file or try again later");
                                    },
                                    uploadDone: () => {
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
                    })).asRefComponent(),
                    [
                        { width: 2 },
                        Vertical(
                            TextInput("text", "Name").sync(data, "name"),
                            TextInput("email", "Email").sync(data, "email")
                        ).setGap("20px")
                    ]
                )
                    .setDynamicColumns(1, "12rem")
                    .addClass("settings-form")
                    .setGap("15px")
            ).setGap("20px").addClass("limited-width"),
        ]).setValidator((v) => v.object({
            name: v.string().min(2),
            email: v.string().email()
        }).strip())
    ]);
}
