import { API } from "shared/mod.ts";
import { stupidErrorAlert } from "shared/restSpec.ts";
import { AdvancedImage, asState, Box, Button, CenterV, createFilePicker, DropAreaInput, DropDownInput, Empty, getErrorMessage, Grid, Horizontal, IconButton, Image, Label, MIcon, Spacer, TextInput, Validate } from "webgen/mod.ts";
import { zod } from "webgen/zod.ts";
import { templateArtwork } from "../../../assets/imports.ts";
import genres from "../../../data/genres.json" with { type: "json" };
import language from "../../../data/language.json" with { type: "json" };
import { artistref, DATE_PATTERN, Drop, song, userString } from "../../../spec/music.ts";
import { uploadArtwork } from "../../music/data.ts";
import { EditArtistsDialog } from "../../music/views/table.ts";
import { allowedImageFormats, getSecondary } from "../helper.ts";

export function ChangeDrop(drop: Drop) {
    const state = asState({
        artworkClientData: <AdvancedImage | undefined> (drop.artwork ? <AdvancedImage> { type: "direct", source: () => API.music.id(drop._id!).artwork().then(stupidErrorAlert) } : undefined),
        validationState: <zod.ZodError | undefined> undefined,
    });

    const { data, error, validate } = Validate(
        asState(drop),
        zod.object({
            title: userString,
            artists: artistref.array().refine((x) => x.some(({ type }) => type == "PRIMARY"), { message: "At least one primary artist is required" }),
            release: zod.string().regex(DATE_PATTERN, { message: "Not a date" }),
            language: zod.string(),
            primaryGenre: zod.string(),
            secondaryGenre: zod.string(),
            compositionCopyright: userString,
            soundRecordingCopyright: userString,
            artwork: zod.string(),
            songs: song.array().min(1, { message: "At least one song is required" }),
        }),
    );

    const validator2 = Validate(
        state,
        zod.object({
            artworkClientData: zod.object({
                type: zod.string().refine((x) => x !== "uploading", { message: "Artwork is still uploading" }),
            }),
        }),
    );

    return Grid(
        [
            { width: 2 },
            Horizontal(
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
                Spacer(),
                Button("Save")
                    .onClick(async () => {
                        const validation = validate();
                        validator2.validate();
                        if (error.getValue()) return state.validationState = error.getValue();
                        if (validator2.error.getValue()) return state.validationState = validator2.error.getValue();
                        if (validation) await API.music.id(data._id!).update(validation);
                        location.reload(); // Handle this Smarter => Make it a Reload Event.
                    }),
            ),
        ],
        Grid(
            state.$artworkClientData.map((artworkData) =>
                DropAreaInput(
                    Box(artworkData ? Image(artworkData, "A Music Album Artwork.") : Image(templateArtwork, "A Default Alubm Artwork."), IconButton(MIcon("edit"), "edit icon"))
                        .addClass("upload-image"),
                    allowedImageFormats,
                    ([{ file }]) => uploadArtwork(drop._id, file, state.$artworkClientData, data.$artwork),
                ).onClick(() => createFilePicker(allowedImageFormats.join(",")).then((file) => uploadArtwork(drop._id, file, state.$artworkClientData, data.$artwork)))
            ).asRefComponent(),
        ).setDynamicColumns(2, "12rem"),
        [
            { width: 2 },
            TextInput("text", "Title").ref(data.$title),
        ],
        TextInput("date", "Release Date").ref(data.$release),
        DropDownInput("Language", Object.keys(language))
            .setRender((key) => language[<keyof typeof language> key])
            .ref(data.$language),
        [
            { width: 2 },
            Button("Artists")
                .onClick(() => {
                    EditArtistsDialog(data.$artists).open();
                }),
        ],
        [{ width: 2, height: 2 }, Spacer()],
        [
            { width: 2 },
            Grid(
                DropDownInput("Primary Genre", Object.keys(genres))
                    .ref(data.$primaryGenre)
                    .onChange(() => data.secondaryGenre = undefined!),
                data.$primaryGenre.map((primaryGenre) =>
                    DropDownInput("Secondary Genre", getSecondary(genres, primaryGenre) ?? [])
                        .ref(data.$secondaryGenre)
                        .setWidth("100%")
                ).asRefComponent(),
            )
                .setEvenColumns(2, "minmax(2rem, 20rem)")
                .setGap("15px"),
        ],
        TextInput("text", "Composition Copyright").ref(data.$compositionCopyright),
        TextInput("text", "Sound Recording Copyright").ref(data.$soundRecordingCopyright),
    )
        .setEvenColumns(2, "minmax(2rem, 20rem)")
        .setJustifyContent("center")
        .addClass("limited-width")
        .setGap("15px");
}
