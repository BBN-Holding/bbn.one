import { delay } from "@std/async";
import { activeUser, allowedImageFormats, forceRefreshToken, IsLoggedIn, showProfilePicture } from "shared/helper.ts";
import { API, StreamingUploadHandler, stupidErrorAlert } from "shared/mod.ts";
import { asRef, asRefRecord, Box, createFilePicker, Empty, Grid, Label, MaterialIcon, PrimaryButton, TextInput } from "webgen/mod.ts";
import { z } from "zod/mod.ts";

export function ChangePersonal() {
    const state = asRefRecord({
        email: activeUser.email,
        name: activeUser.username,
        validationState: <z.ZodError | undefined> undefined,
    });

    const profilePicture = asRef(showProfilePicture(IsLoggedIn()!).setTextSize("8xl"));

    return Grid(
        Grid(
            profilePicture.map((pic) =>
                Box(pic, IconButton(MaterialIcon("edit"), "edit-icon")).addClass("upload-image").onClick(async () => {
                    const file = await createFilePicker(allowedImageFormats.join(","));
                    const blobUrl = URL.createObjectURL(file);
                    profilePicture.setValue(Image({ type: "uploading", filename: file.name, blobUrl, percentage: 0 }, "Profile Picture"));
                    setTimeout(() => {
                        StreamingUploadHandler(`user/set-me/avatar/upload`, {
                            failure: () => {
                                profilePicture.setValue(showProfilePicture(IsLoggedIn()!).setTextSize("8xl"));
                                alert("Your Upload has failed. Please try a different file or try again later");
                            },
                            uploadDone: () => {
                                profilePicture.setValue(Image({ type: "waiting-upload", filename: file.name, blobUrl }, "Profile Picture"));
                            },
                            backendResponse: () => {
                                profilePicture.setValue(Image({ type: "direct", source: async () => await file }, "Profile Picture"));
                            },
                            credentials: () => API.getToken(),
                            onUploadTick: async (percentage) => {
                                profilePicture.setValue(Image({ type: "uploading", filename: file.name, blobUrl, percentage }, "Profile Picture"));
                                await delay(2);
                            },
                        }, file);
                    });
                })
            ),
            [
                { width: 2 },
                Vertical(
                    TextInput("text", "Name").ref(state.$name),
                    TextInput("email", "Email").ref(state.$email),
                ).setGap("20px"),
            ],
        )
            .setDynamicColumns(1, "12rem")
            .setJustifyContent("center")
            .setGap("15px"),
        Grid(
            Box(
                state.$validationState.map((error) =>
                    error
                        ? CenterV(
                            Label(getErrorMessage(error))
                                .addClass("error-message")
                                .setMargin("0 0.5rem 0 0"),
                        )
                        : Empty()
                ).asRefComponent(),
            ),
            PrimaryButton("Save").onClick(async () => {
                const { error, validate } = Validate(
                    state,
                    zod.object({
                        name: zod.string().min(2),
                        email: zod.string().email(),
                    }),
                );

                const data = validate();
                if (error.getValue()) return state.validationState = error.getValue();
                if (data) {
                    await API.user.setMe.post(state)
                        .then(stupidErrorAlert);
                }
                await forceRefreshToken();
                location.reload();
                state.validationState = undefined;
            }),
        ),
    ).setGap("20px").addClass("limited-width");
}
