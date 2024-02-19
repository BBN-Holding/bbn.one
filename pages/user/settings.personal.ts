import { ZodError } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { API, StreamingUploadHandler, stupidErrorAlert } from "shared/mod.ts";
import { delay } from "std/async/mod.ts";
import { AdvancedImage, Box, Button, CenterV, Empty, Grid, Horizontal, IconButton, Image, Label, MIcon, Spacer, TextInput, Validate, Vertical, asState, createFilePicker, getErrorMessage } from "webgen/mod.ts";
import { zod } from "webgen/zod.ts";
import { activeUser, allowedImageFormats, forceRefreshToken } from "../_legacy/helper.ts";

export function ChangePersonal() {
    const state = asState({
        email: activeUser.email,
        name: activeUser.username,
        loading: false,
        profilePicture: activeUser.avatar ? { type: "direct", source: async () => await API.user.picture(activeUser.id!).then(stupidErrorAlert) } : { type: "loading" } as AdvancedImage | undefined,
        validationState: <ZodError | undefined>undefined,
    });

    return Vertical(
        Grid(
            state.$profilePicture.map(profilePicture => Box(Image(profilePicture ?? { type: "loading" }, "Your Avatarimage"), IconButton(MIcon("edit"), "edit-icon")).addClass("upload-image").onClick(async () => {
                const file = await createFilePicker(allowedImageFormats.join(","));
                const blobUrl = URL.createObjectURL(file);
                profilePicture = <AdvancedImage>{ type: "uploading", filename: file.name, blobUrl, percentage: 0 };
                state.loading = true;
                setTimeout(() => {
                    StreamingUploadHandler(`user/set-me/avatar/upload`, {
                        failure: () => {
                            state.loading = false;
                            state.profilePicture = activeUser.avatar ? { type: "direct", source: async () => await API.user.picture(activeUser.id!).then(stupidErrorAlert) } : { type: "loading" };
                            alert("Your Upload has failed. Please try a different file or try again later");
                        },
                        uploadDone: () => {
                            state.profilePicture = <AdvancedImage>{ type: "waiting-upload", filename: file.name, blobUrl };
                        },
                        backendResponse: () => {
                            state.loading = false;
                            state.profilePicture = <AdvancedImage>{ type: "direct", source: async () => await file };
                        },
                        credentials: () => API.getToken(),
                        onUploadTick: async (percentage) => {
                            state.profilePicture = <AdvancedImage>{ type: "uploading", filename: file.name, blobUrl, percentage };
                            await delay(2);
                        }
                    }, file);
                });

            })).asRefComponent(),
            [
                { width: 2 },
                Vertical(
                    TextInput("text", "Name").sync(state, "name"),
                    TextInput("email", "Email").sync(state, "email")
                ).setGap("20px")
            ]
        )
            .setDynamicColumns(1, "12rem")
            .setJustifyContent("center")
            .setGap("15px"),
        Horizontal(
            Spacer(),
            Box(state.$validationState.map(error => error ? CenterV(
                Label(getErrorMessage(error))
                    .addClass("error-message")
                    .setMargin("0 0.5rem 0 0")
            )
                : Empty()).asRefComponent()),
            Button("Save").onClick(async () => {
                const { error, validate } = Validate(
                    state,
                    zod.object({
                        name: zod.string().min(2),
                        email: zod.string().email()
                    })
                );

                const data = validate();
                if (error.getValue()) return state.validationState = error.getValue();
                if (data) await API.user.setMe.post(state)
                    .then(stupidErrorAlert);
                await forceRefreshToken();
                location.reload();
                state.validationState = undefined;
            })),
    ).setGap("20px").addClass("limited-width");
};