import { AdvancedImage, Box, Button, Custom, DropDownInput, Grid, IconButton, Image, img, Page, Reactive, Spacer, TextInput, View, Wizard } from "webgen/mod.ts";
import { allowedImageFormats, EditArtists, getSecondary } from "../helper.ts";
import { ActionBar } from "../misc/actionbar.ts";
import { changePage, HandleSubmit, setErrorMessage } from "../misc/common.ts";
import { API, Drop } from "../RESTSpec.ts";
import { EditViewState } from "./types.ts";
import language from "../../../data/language.json" assert { type: "json" };
import primary from "../../../data/primary.json" assert { type: "json" };
import secondary from "../../../data/secondary.json" assert { type: "json" };

import { uploadFilesDialog } from "../upload.ts";
import { uploadArtwork } from "./data.ts";

export function ChangeDrop(drop: Drop, update: (data: Partial<EditViewState>) => void) {
    return Wizard({
        submitAction: async ([ { data: { data } } ]) => {
            await API.music(API.getToken())
                .id(drop._id)
                .put(data);
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
            artworkClientData: <AdvancedImage | string | undefined>undefined
        }, data => [
            Grid(
                Grid(
                    Reactive(data, "artwork", () => Box(
                        Image(data.artwork ?? { type: "loading" }, "Your Avatarimage"), IconButton("edit")
                    )
                        .addClass("upload-image")
                        .onClick(() => uploadFilesDialog(([ file ]) => uploadArtwork(data, file), allowedImageFormats.join(",")))
                    ),
                ).setDynamicColumns(2, "12rem"),
                [
                    { width: 2 },
                    TextInput("text", "Title").sync(data, "title")
                ],
                TextInput("date", "Release Date").sync(data, "release"),
                DropDownInput("Language", language)
                    .sync(data, "language")
                    .addClass("justify-content-space"),
                [
                    { width: 2 },
                    // TODO: Make this a nicer component
                    Button("Artists")
                        .onClick(() => {
                            EditArtists(data.artists ?? [ [ "", "", "PRIMARY" ] ]).then((x) => {
                                data.artists = x;
                                console.log(data);
                            });
                        }),
                ],
                [ { width: 2, heigth: 2 }, Spacer() ],
                [
                    { width: 2 },
                    View(({ update }) =>
                        Grid(
                            DropDownInput("Primary Genre", primary)
                                .sync(data, "primaryGenre")
                                .addClass("justify-content-space")
                                .onChange(() => {
                                    data.delete("secondaryGenre");
                                    update({});
                                }),
                            DropDownInput("Secondary Genre", getSecondary(secondary, data.primaryGenre) ?? [])
                                .sync(data, "secondaryGenre")
                                .addClass("justify-content-space"),
                        )
                            .setEvenColumns(2, "minmax(2rem, 20rem)")
                            .setGap("15px")
                    )
                        .asComponent()
                ],
                TextInput("text", "Composition Copyright").sync(data, "compositionCopyright"),
                TextInput("text", "Sound Recording Copyright").sync(data, "soundRecordingCopyright")
            )
                .setEvenColumns(2, "minmax(2rem, 20rem)")
                .addClass("settings-form")
                .addClass("limited-width")
                .setGap("15px")
        ]).setValidator((v) => v.object({
            loading: v.void()
        }))
    ]
    );
}