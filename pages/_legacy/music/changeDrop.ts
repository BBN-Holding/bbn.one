import { API, stupidErrorAlert, uploadFilesDialog } from "shared/mod.ts";
import { AdvancedImage, Box, Button, DropAreaInput, DropDownInput, Grid, IconButton, Image, MIcon, Page, Spacer, State, TextInput, Wizard } from "webgen/mod.ts";
import artwork from "../../../assets/img/template-artwork.png";
import genres from "../../../data/genres.json" with { type: "json" };
import language from "../../../data/language.json" with { type: "json" };
import { ArtistTypes, Drop, pureDrop } from "../../../spec/music.ts";
import { EditArtists, allowedImageFormats, getSecondary } from "../helper.ts";
import { uploadArtwork } from "./data.ts";

export function ChangeDrop(drop: Drop) {
    return Wizard({
        submitAction: async (data) => {
            let obj = structuredClone(drop);
            data.map(x => x.data.data).forEach(x => obj = { ...obj, ...x });
            await API.music.id(drop._id).update(obj);
            location.reload(); // Handle this Smarter => Make it a Reload Event.
        },
        buttonArrangement: "flex-end",
        buttonAlignment: "top",
    }, () => [
        Page({
            title: drop.title,
            release: drop.release,
            language: drop.language,
            artists: drop.artists,
            primaryGenre: drop.primaryGenre,
            secondaryGenre: drop.secondaryGenre,
            compositionCopyright: drop.compositionCopyright,
            soundRecordingCopyright: drop.soundRecordingCopyright,

            loading: false,
            artwork: drop.artwork,
            artworkClientData: <AdvancedImage | string | undefined>(drop.artwork ? <AdvancedImage>{ type: "direct", source: () => API.music.id(drop._id).artwork().then(stupidErrorAlert) } : undefined),

            uploadingSongs: [],
            songs: drop.songs
        }, data => [
            Grid(
                Grid(
                    data.$artworkClientData.map(() => DropAreaInput(
                        Box(data.artworkClientData ? Image(data.artworkClientData, "A Music Album Artwork.") : Image(artwork, "A Default Alubm Artwork."), IconButton(MIcon("edit"), "edit icon"))
                            .addClass("upload-image"),
                        allowedImageFormats,
                        ([ { file } ]) => uploadArtwork(data, file)
                    ).onClick(() => uploadFilesDialog(([ file ]) => {
                        uploadArtwork(data, file);
                    }, allowedImageFormats.join(",")))).asRefComponent(),
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
                    // TODO: Make this a nicer component
                    Button("Artists")
                        .onClick(() => {
                            EditArtists(data.artists ?? [ [ "", "", ArtistTypes.Primary ] ]).then((x) => {
                                data.artists = State(x);
                            });
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
                        data.$primaryGenre.map(() => DropDownInput("Secondary Genre", getSecondary(genres, data.primaryGenre) ?? [])
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
                .setGap("15px")
        ]).setValidator(() => pureDrop)
    ]
    );
}