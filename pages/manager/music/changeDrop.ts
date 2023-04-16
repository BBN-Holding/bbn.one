import { AdvancedImage, Box, Button, DropAreaInput, DropDownInput, Grid, IconButton, Image, Page, Reactive, Spacer, State, TextInput, Wizard } from "webgen/mod.ts";
import { allowedImageFormats, EditArtists, getSecondary } from "../helper.ts";
import { ActionBar } from "../misc/actionbar.ts";
import { changePage, HandleSubmit, setErrorMessage } from "../misc/common.ts";
import { API } from "../RESTSpec.ts";
import { EditViewState } from "./types.ts";
import language from "../../../data/language.json" assert { type: "json" };
import primary from "../../../data/primary.json" assert { type: "json" };
import secondary from "../../../data/secondary.json" assert { type: "json" };
import artwork from "../../../assets/img/template-artwork.png";
import { uploadFilesDialog } from "../upload.ts";
import { uploadArtwork } from "./data.ts";
import { ArtistTypes, Drop, pureDrop } from "../../../spec/music.ts";

export function ChangeDrop(drop: Drop, update: (data: Partial<EditViewState>) => void) {
    return Wizard({
        submitAction: async (data) => {
            let obj = structuredClone(drop);
            // @ts-ignore fuck typings
            data.map(x => x.data.data).forEach(x => obj = { ...obj, ...x });

            // deno-lint-ignore no-explicit-any
            await API.music(API.getToken()).id(drop._id).post(<any>obj);

            location.reload(); // Handle this Smarter => Make it a Reload Event.
        },
        buttonArrangement: ({ PageValid, Submit }) => {
            setErrorMessage();
            return ActionBar("Drop", undefined, {
                title: "Update", onclick: HandleSubmit(PageValid, Submit)
            }, [ { title: drop.title || "(no title)", onclick: changePage(update, "main") } ]);
        },
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
            artworkClientData: <AdvancedImage | string | undefined>(drop?.artwork ? <AdvancedImage>{ type: "direct", source: () => API.music(API.getToken()).id(drop._id).artworkPreview() } : undefined),

            uploadingSongs: [],
            songs: drop.songs
        }, data => [
            Grid(
                Grid(
                    Reactive(data, "artworkClientData", () => DropAreaInput(
                        Box(data.artworkClientData ? Image(data.artworkClientData, "A Music Album Artwork.") : Image(artwork, "A Default Alubm Artwork."), IconButton("edit", "edit icon"))
                            .addClass("upload-image"),
                        allowedImageFormats,
                        ([ { file } ]) => uploadArtwork(data, file)
                    ).onClick(() => uploadFilesDialog(([ file ]) => {
                        uploadArtwork(data, file);
                    }, allowedImageFormats.join(",")))),
                ).setDynamicColumns(2, "12rem"),
                [
                    { width: 2 },
                    TextInput("text", "Title").sync(data, "title")
                ],
                TextInput("date", "Release Date").sync(data, "release"),
                // TODO: Show user spelled out language
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
                                console.log(data);
                            });
                        }),
                ],
                [ { width: 2, heigth: 2 }, Spacer() ],
                [
                    { width: 2 },
                    Grid(
                        DropDownInput("Primary Genre", primary)
                            .sync(data, "primaryGenre")
                            .onChange(() => {
                                data.secondaryGenre = undefined!;
                            }),
                        Reactive(data, "primaryGenre", () => DropDownInput("Secondary Genre", getSecondary(secondary, data.primaryGenre) ?? [])
                            .sync(data, "secondaryGenre")
                            .addClass("border-box")
                            .setWidth("100%")
                        ),
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