import '../../assets/css/main.css';
import '../../assets/css/components/subsidiaries.css';
import '../../assets/css/wizard.css';
import { DynaNavigation } from "../../components/nav.ts";
import primary from "../../data/primary.json" assert { type: "json"};
import language from "../../data/language.json" assert { type: "json"};

import { View, WebGen, loadingWheel, Horizontal, PlainText, Center, Vertical, Spacer, Input, Button, ButtonStyle, SupportedThemes, Grid, MaterialIcons, Color, DropDownInput, Wizard, Page, createElement, img, Custom, Component, DropAreaInput, CenterV } from "../../deps.ts";
import { TableData } from "./types.ts";
import { allowedAudioFormats, allowedImageFormats, CenterAndRight, Redirect, syncFromData, Table, UploadTable } from "./helper.ts";
import { TableDef } from "./music/table.ts";
import { API, Drop } from "./RESTSpec.ts";

WebGen({
    theme: SupportedThemes.dark,
    icon: new MaterialIcons()
})
Redirect()
const params = new URLSearchParams(location.search);
if (!params.has("id")) {
    alert("ID is missing")
    location.href = "/music";
}

const gapSize = "15px";
const inputWidth = "436px";
function uploadFilesDialog(onData: (files: { blob: Blob, file: File, url: string }[]) => void, accept: string) {
    const upload = createElement("input")
    upload.type = "file";
    upload.accept = accept;
    upload.click();
    upload.onchange = async () => {
        const list = await Promise.all(Array.from(upload.files ?? []).map(async file => {
            const blob = new Blob([ await file.arrayBuffer() ], { type: file.type });
            return { blob, file, url: URL.createObjectURL(blob) };
        }))
        onData(list);
    };
}

// TODO: Wizard Restore
// TODO: Input zu neuen FormComponents umlagern
View<{ restoreData: Drop }>(({ state, update }) => Vertical(
    DynaNavigation("Music"),
    Spacer(),
    state.restoreData == null
        ? (() => {
            API.music(API.getToken())[ '{id}' ](params.get("id")!).get().then(restoreData => {
                update({ restoreData })
            }).catch(() => {
                setTimeout(() => location.reload(), 1000);
            })
            return CenterV(
                Center(
                    Custom(loadingWheel() as Element as HTMLElement)
                ).addClass("loading"),
                Spacer()
            ).addClass("wwizard");
        })()
        : wizard(state.restoreData)
))
    .addClass("fullscreen")
    .appendOn(document.body);

const wizard = (restore?: Drop) => Wizard({
    cancelAction: "/music",
    buttonArrangement: "space-between",
    nextAction: async (pages) => {
        const single = new FormData();
        const list = pages.map(x => Array.from(x.data.entries())).flat();
        for (const [ key, value ] of list) {
            single.append(key, value);
        }
        await API
            .music(API.getToken())
        [ '{id}' ](new URLSearchParams(location.search).get("id")!)
            .put(single);
    },
    submitAction: () => {

    }
}, ({ Next }) => [
    Page((formData) => [
        PlainText("Lets make your Drop hit!"),
        Spacer(),
        Horizontal(
            Spacer(),
            Vertical(
                Center(PlainText("First we need an UPC/EAN number:")),
                Input({
                    ...syncFromData(formData, "upc"),
                    placeholder: "UPC/EAN"
                }).setWidth(inputWidth),
                Button("I don't have one")
                    .setJustify("center")
                    .setStyle(ButtonStyle.Secondary)
                    .onClick(Next)
            ).setGap(gapSize),
            Spacer()
        ),
    ]).setDefaultValues({ upc: restore?.upc }),
    Page((formData) => [
        Spacer(),
        Center(
            Vertical(
                Center(PlainText("Enter your Album details.")),
                Input({
                    ...syncFromData(formData, "title"),
                    placeholder: "Title"
                }).setWidth(inputWidth),
                Grid(
                    Input({
                        ...syncFromData(formData, "release"),
                        placeholder: "Release Date",
                        type: "text"
                    }),
                    DropDownInput("Language", language)
                        .syncFormData(formData, "language")
                        .addClass("custom")
                )
                    .setEvenColumns(2)
                    .setGap(gapSize)
                    .setWidth(inputWidth),
                Input({
                    placeholder: "Artistlist",
                    ...syncFromData(formData, "artistList"),
                }),
                Center(PlainText("Set your target Audience")),
                Grid(
                    DropDownInput("Primary Genre", primary)
                        .syncFormData(formData, "primaryGenre")
                        .addClass("custom"),
                    DropDownInput("Secondary Genre", primary)
                        .setStyle(ButtonStyle.Secondary)
                        .setColor(Color.Disabled),
                )
                    .setGap(gapSize)
                    .setEvenColumns(2)
            ).setGap(gapSize)
        ),
    ]).setDefaultValues({
        title: restore?.title,
        release: restore?.release,
        language: restore?.language,
        artistList: JSON.stringify(restore?.artists),
        primaryGenre: restore?.primaryGenre,
    }),
    Page((formData) => [
        Spacer(),
        Center(
            Vertical(
                Center(PlainText("Display the Copyright")),
                Input({
                    placeholder: "Composition Copyright",
                    ...syncFromData(formData, "compositionCopyright")
                })
                    .setWidth(inputWidth),
                Input({
                    placeholder: "Sound Recording Copyright",
                    ...syncFromData(formData, "soundRecordingCopyright")
                })
                    .setWidth(inputWidth),
            )
                .setGap(gapSize)
        ),
    ]).setDefaultValues({
        compositionCopyright: restore?.compositionCopyright,
        soundRecordingCopyright: restore?.soundRecordingCopyright
    }),
    Page((formData) => [
        Spacer(),
        Center(
            View(({ update }) =>
                Vertical(
                    CenterAndRight(
                        PlainText("Upload your Cover"),
                        Button("Manual Upload")
                            .onClick(() => uploadFilesDialog(([ { blob, url } ]) => {
                                formData.set("artwork.url", url)
                                formData.set("artwork", blob)
                                update({});
                            }, allowedImageFormats.join(",")))
                    ),
                    DropAreaInput(CenterV(
                        formData.has("artwork.url")
                            ? ImageFrom(formData, "artwork.url")!
                            : PlainText("Drag & Drop your File here")
                    ), allowedImageFormats, ([ { blob, url } ]) => {
                        formData.set("artwork.url", url)
                        formData.set("artwork", blob)
                        update({});
                    }).addClass("drop-area")
                )
                    .setGap(gapSize)
            ).asComponent()
        ),
    ]).setDefaultValues({
        // artwork: TODO(Backend): Implement fetchting files
    }),
    Page((formData) => [
        Spacer(),
        Horizontal(
            Spacer(),
            View(({ update }) =>
                Vertical(
                    CenterAndRight(
                        PlainText("Manage your Music"),
                        Button("Manual Upload")
                            .onClick(() => uploadFilesDialog((list) => addSongs(list, formData, update), allowedAudioFormats.join(",")))
                    ),
                    formData.has("songs") ?
                        Table<TableData>(TableDef(formData), formData.getAll("songs").map(x => {
                            return <TableData>{
                                Id: x,
                                Name: formData.get(`song.${x}.name`)?.toString(),
                                Year: formData.get(`song.${x}.year`)?.toString(),
                                Explicit: formData.get(`song.${x}.explicit`) == "true",
                            };
                        }))
                            .addClass("inverted-class")
                        : UploadTable(TableDef(formData), (list) => addSongs(list, formData, update))
                            .addClass("inverted-class")

                ).setGap(gapSize),
            ).asComponent(),
            Spacer()
        ),
    ]).setDefaultValues({
        songs: JSON.stringify(restore?.songs)
    }),
    Page((formData) => [
        Spacer(),
        Horizontal(
            Spacer(),
            PlainText("Thank! Thats everything we need."),
            Spacer(),
        ),
        Horizontal(
            Spacer(),
            Input({
                placeholder: "Comments for Submit",
                ...syncFromData(formData, "comments")
            }),
            Spacer()
        ),
    ]).setDefaultValues({
        comments: restore?.comments
    })
])
function addSongs(list: { blob: Blob; file: File; }[], formData: FormData, update: (data: Partial<unknown>) => void) {
    list.map(x => ({ ...x, id: crypto.randomUUID() })).forEach(({ blob, file, id }) => {
        formData.append("songs", id);
        const cleanedUpTitle = file.name
            .replaceAll("_", " ")
            .replaceAll("-", " ")
            .replace(/\.[^/.]+$/, "");

        formData.set(`song.${id}.blob`, blob);
        formData.set(`song.${id}.title`, cleanedUpTitle); // Our AI prediceted name
        formData.set(`song.${id}.year`, new Date().getFullYear().toString());
        // TODO Add Defaults for Country, Primary Genre => Access global FormData and merge it to one and then pull it
    });
    update({});
}

function ImageFrom(formData: FormData, key: string): Component | undefined {
    return formData.has(key) ? Custom(img(formData.get(key)! as string)) : undefined;
}
