import { Box, Button, Custom, DropDownInput, Grid, IconButton, img, Page, PlainText, Spacer, TextInput, View, Wizard } from "webgen/mod.ts";
import { allowedImageFormats, EditArtists, getSecondary } from "../helper.ts";
import { ActionBar } from "../misc/actionbar.ts";
import { changePage, HandleSubmit, setErrorMessage, Validate } from "../misc/common.ts";
import { API, Drop } from "../RESTSpec.ts";
import { EditViewState } from "./types.ts";
import language from "../../../data/language.json" assert { type: "json" };
import primary from "../../../data/primary.json" assert { type: "json" };
import secondary from "../../../data/secondary.json" assert { type: "json" };

import { uploadFilesDialog } from "../upload.ts";
import { StreamingUploadHandler } from "../upload.ts";
import { delay } from "https://deno.land/std@0.140.0/async/delay.ts";

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
            artists: JSON.stringify(drop.artists),
            primaryGenre: drop.primaryGenre,
            secondaryGenre: drop.secondaryGenre,
            compositionCopyright: drop.compositionCopyright,
            soundRecordingCopyright: drop.soundRecordingCopyright
        }, data => [
            Grid(
                // TODO: Refactor this into ImageInput()
                Grid(
                    View<{ path: string; }>(({ state, update }) => Box(
                        Custom(img(state.path)).addClass("upload-image"),
                        IconButton("edit")
                    )
                        .addClass("image-edit")
                        .onClick(() => uploadFilesDialog(([ file ]) => {
                            data.set("loading", "-");
                            update({ path: URL.createObjectURL(file) });
                            setTimeout(() => {
                                const image = document.querySelector(".upload-image")!;
                                StreamingUploadHandler(`music/${drop._id}/upload`, {
                                    failure: () => {
                                        data.delete("loading");
                                        alert("Your Upload has failed. Please try a different file or try again later");
                                        update({});
                                    },
                                    prepare: () => {
                                        const animation = image.animate([
                                            { filter: "grayscale(1) blur(23px)", transform: "scale(0.6)" },
                                            { filter: "grayscale(0) blur(0px)", transform: "scale(1)" },
                                        ], { duration: 100, fill: 'forwards' });
                                        animation.currentTime = 0;
                                        animation.pause();
                                    },
                                    credentials: () => API.getToken(),
                                    backendResponse: (id) => {
                                        data.set("artwork", id);
                                        data.delete("loading");
                                        update({});
                                    },
                                    onUploadTick: async (percentage) => {
                                        const animation = image.animate([
                                            { filter: "grayscale(1) blur(23px)", transform: "scale(0.6)" },
                                            { filter: "grayscale(0) blur(0px)", transform: "scale(1)" },
                                        ], { duration: 100, fill: 'forwards' });
                                        animation.currentTime = percentage;
                                        animation.pause();
                                        await delay(5);
                                    },
                                    uploadDone: () => { }
                                }, file);
                            });
                        }, allowedImageFormats.join(","))))
                        .change(({ update }) => update({ path: drop[ "artwork-url" ] }))
                        .asComponent(),
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
                            EditArtists(data.get("artists") ? JSON.parse(data.get("artists")!.toString()) : [ [ "", "", "PRIMARY" ] ]).then((x) => data.set("artists", JSON.stringify(x)));
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