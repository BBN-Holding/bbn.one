import * as zod from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { ZodError } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { API } from "shared/mod.ts";
import { stupidErrorAlert } from "shared/restSpec.ts";
import { AdvancedImage, Box, Button, CenterV, DropAreaInput, DropDownInput, Empty, Grid, Horizontal, IconButton, Image, Label, MIcon, Spacer, StateHandler, TextInput, Validate, asState, createFilePicker, getErrorMessage } from "webgen/mod.ts";
import artwork from "../../../assets/img/template-artwork.png";
import genres from "../../../data/genres.json" with { type: "json" };
import language from "../../../data/language.json" with { type: "json" };
import { Artist, DATE_PATTERN, artist, song, userString } from "../../../spec/music.ts";
import { EditArtistsDialog, allowedImageFormats, getSecondary } from "../helper.ts";
import { uploadArtwork } from "./data.ts";

export function ChangeDrop(drop: StateHandler<{ _id: string | undefined, title: string | undefined, release: string | undefined, language: string | undefined, artists: Artist[], artwork: string | undefined, compositionCopyright: string | undefined, soundRecordingCopyright: string | undefined, primaryGenre: string | undefined, secondaryGenre: string | undefined; }>) {
    const state = asState({
        artworkClientData: <AdvancedImage | string | undefined>(drop.artwork ? <AdvancedImage>{ type: "direct", source: () => API.music.id(drop._id!).artwork().then(stupidErrorAlert) } : undefined),
        loading: false,
        validationState: <ZodError | undefined>undefined
    });

    const { data, error, validate } = Validate(
        drop,
        zod.object({
            title: userString,
            artists: artist.array().refine(x => x.some(([ , , type ]) => type == "PRIMARY"), { message: "At least one primary artist is required" }),
            release: zod.string().regex(DATE_PATTERN, { message: "Not a date" }),
            language: zod.string(),
            primaryGenre: zod.string(),
            secondaryGenre: zod.string(),
            compositionCopyright: userString,
            soundRecordingCopyright: userString,
            artwork: zod.string(),
            songs: song.array().min(1, { message: "At least one song is required" }),
        })
    );

    const validator2 = Validate(
        state,
        zod.object({
            loading: zod.literal(false, { errorMap: () => ({ message: "Artwork is still uploading" }) }).transform(() => undefined),
        })
    );

    return Grid(
        [
            { width: 2 },
            Horizontal(
                Box(state.$validationState.map(error => error ? CenterV(
                    Label(getErrorMessage(error))
                        .addClass("error-message")
                        .setMargin("0 0.5rem 0 0")
                )
                    : Empty()).asRefComponent()),
                Spacer(),
                Button("Save")
                    .onClick(async () => {
                        const validation = validate();
                        validator2.validate();
                        if (error.getValue()) return state.validationState = error.getValue();
                        if (validator2.error.getValue()) return state.validationState = validator2.error.getValue();
                        if (validation) await API.music.id(data._id!).update(validation);
                        location.reload(); // Handle this Smarter => Make it a Reload Event.
                    })
            ),
        ],
        Grid(
            state.$artworkClientData.map(artworkData => DropAreaInput(
                Box(artworkData ? Image(artworkData, "A Music Album Artwork.") : Image(artwork, "A Default Alubm Artwork."), IconButton(MIcon("edit"), "edit icon"))
                    .addClass("upload-image"),
                allowedImageFormats,
                ([ { file } ]) => uploadArtwork(drop._id!, file, state.$artworkClientData, state.$loading, data.$artwork)
            ).onClick(() => createFilePicker(allowedImageFormats.join(",")).then(file => uploadArtwork(drop._id!, file, state.$artworkClientData, state.$loading, data.$artwork)))).asRefComponent(),
        ).setDynamicColumns(2, "12rem"),
        [
            { width: 2 },
            TextInput("text", "Title").sync(data, "title")
        ],
        TextInput("date", "Release Date").sync(data, "release"),
        DropDownInput("Language", Object.keys(language))
            .setRender((key) => language[ <keyof typeof language>key ])
            .sync(data, "language"),
        [
            { width: 2 },
            Button("Artists")
                .onClick(() => {
                    EditArtistsDialog(data).open();
                }),
        ],
        [ { width: 2, height: 2 }, Spacer() ],
        [
            { width: 2 },
            Grid(
                DropDownInput("Primary Genre", Object.keys(genres))
                    .sync(data, "primaryGenre")
                    .onChange(() => {
                        data.secondaryGenre = undefined!;
                    }),
                data.$primaryGenre.map(primaryGenre => DropDownInput("Secondary Genre", getSecondary(genres, primaryGenre) ?? [])
                    .sync(data, "secondaryGenre")
                    .addClass("border-box")
                    .setWidth("100%")
                ).asRefComponent(),
            )
                .setEvenColumns(2, "minmax(2rem, 20rem)")
                .setGap("15px")
        ],
        TextInput("text", "Composition Copyright").sync(data, "compositionCopyright"),
        TextInput("text", "Sound Recording Copyright").sync(data, "soundRecordingCopyright")
    )
        .setEvenColumns(2, "minmax(2rem, 20rem)")
        .addClass("settings-form")
        .addClass("limited-width")
        .setGap("15px");
}