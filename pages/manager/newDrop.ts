import { DynaNavigation } from "../../components/nav.ts";
import primary from "../../data/primary.json" assert { type: "json"};
import language from "../../data/language.json" assert { type: "json"};
import { View, WebGen, loadingWheel, Horizontal, PlainText, Center, Vertical, Spacer, Input, Button, ButtonStyle, SupportedThemes, Grid, MaterialIcons, Color, DropDownInput, Wizard, Page, createElement, img, Custom, Component, DropAreaInput, CenterV } from "../../deps.ts";
import { TableData } from "./types.ts";
import { allowedAudioFormats, allowedImageFormats, CenterAndRight, EditArtists, GetCachedProfileData, ProfileData, Redirect, RegisterAuthRefresh, syncFromData, Table, UploadTable } from "./helper.ts";
import { TableDef } from "./music/table.ts";
import { API, Drop } from "./RESTSpec.ts";
import '../../assets/css/wizard.css';
import '../../assets/css/main.css';
import { DeleteFromForm, FormToRecord, RecordToForm } from "./data.ts";
import { StreamingUploadHandler } from "./upload.ts";
import { delay } from "https://deno.land/std@0.140.0/async/delay.ts";

WebGen({
    theme: SupportedThemes.dark,
    icon: new MaterialIcons()
});
Redirect();
RegisterAuthRefresh();
const params = new URLSearchParams(location.search);

if (!params.has("id")) {
    alert("ID is missing");
    location.href = "/music";
}
const gapSize = "15px";
const inputWidth = "436px";
function uploadFilesDialog(onData: (files: File[]) => void, accept: string) {
    const upload = createElement("input");
    upload.type = "file";
    upload.accept = accept;
    upload.click();
    upload.onchange = () => {
        onData(Array.from(upload.files ?? []));
    };
}

// TODO: Input zu neuen FormComponents umlagern
View<{ restoreData: Drop, aboutMe: ProfileData; }>(({ state }) => Vertical(
    DynaNavigation("Music", state.aboutMe),
    Spacer(),
    state.restoreData == null
        ? (() => {
            return CenterV(
                Center(
                    Custom(loadingWheel() as Element as HTMLElement)
                ).addClass("loading"),
                Spacer()
            ).addClass("wwizard");
        })()
        : wizard(state.restoreData)
))
    .change(({ update }) => {
        update({ aboutMe: GetCachedProfileData() });
        API.music(API.getToken())[ 'id' ](params.get("id")!).get().then(async restoreData => {
            if (restoreData.artwork) {
                const blob = await API.music(API.getToken()).id(params.get("id")!).artwork();
                update({ restoreData: { ...restoreData, [ "artwork-url" ]: URL.createObjectURL(blob) } });
            }
            else update({ restoreData });
        }).catch(() => {
            setTimeout(() => location.reload(), 1000);
        });
    })
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
            .id(params.get("id")!)
            .put(single);
    },
    submitAction: async () => {
        const single = new FormData();
        single.set("type", <Drop[ "type" ]>"UNDER_REVIEW");
        await API.music(API.getToken()).id(params.get("id")!).put(single);
        location.href = "/music";
    }
}, ({ Next }) => [
    Page((formData) => [
        PlainText("Lets make your Drop hit!")
            .setWidth("max(1rem, 25rem)")
            .setFont(3.448125, 800),
        Spacer(),
        Horizontal(
            Spacer(),
            Vertical(
                Center(PlainText("First we need an UPC/EAN number:").addClass("title")),
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
                Center(PlainText("Enter your Album details.").addClass("title")),
                Input({
                    ...syncFromData(formData, "title"),
                    placeholder: "Title"
                }).setWidth(inputWidth),
                Grid(
                    (() => {
                        // TODO: Remake this hacky input to DateInput()
                        const input = Input({
                            value: formData.get("release")?.toString(),
                            placeholder: "Release Date",
                            type: "date" as "text"
                        }).draw();
                        const rawInput = input.querySelector("input")!;
                        rawInput.style.paddingRight = "5px";
                        rawInput.onchange = () => formData.set("release", rawInput.value);
                        return Custom(input);
                    })(),
                    DropDownInput("Language", language)
                        .syncFormData(formData, "language")
                        .addClass("custom")
                )
                    .setEvenColumns(2)
                    .setGap(gapSize)
                    .setWidth(inputWidth),
                Button("Artists")
                    .onClick(() => {
                        EditArtists(formData.get("artists") ? JSON.parse(formData.get("artists")!.toString()) : [ [ "", "", "PRIMARY" ] ]).then((x) => formData.set("artists", JSON.stringify(x)));
                    }),
                Center(PlainText("Set your target Audience").addClass("title")),
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
        artists: JSON.stringify(restore?.artists),
        primaryGenre: restore?.primaryGenre,
    }).addValidator((e) => e.object({
        title: e.string(),
        artists: e.string().or(e.array(e.string())),
        release: e.string(),
        language: e.string(),
        primaryGenre: e.string()
    })),
    Page((formData) => [
        Spacer(),
        Center(
            Vertical(
                Center(PlainText("Display the Copyright").addClass("title")),
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
    }).addValidator((e) => e.object({
        compositionCopyright: e.string(),
        soundRecordingCopyright: e.string()
    })),
    Page((formData) => [
        Spacer(),
        Center(
            View(({ update }) =>
                Vertical(
                    CenterAndRight(
                        PlainText("Upload your Cover").addClass("title"),
                        Button("Manual Upload")
                            .onClick(() => uploadFilesDialog(([ file ]) => {
                                uploadArtwork(formData, file, update);
                            }, allowedImageFormats.join(",")))
                    ),
                    DropAreaInput(CenterV(
                        formData.has("artwork-url")
                            ? ImageFrom(formData, "artwork-url").addClass("upload-image")
                            : PlainText("Drag & Drop your File here")
                    ), allowedImageFormats, ([ { file } ]) => {
                        uploadArtwork(formData, file, update);
                    }).addClass("drop-area"),
                    Custom(loadingWheel() as Element as HTMLElement)
                )
                    .addClass(formData.has("loading") ? "loading" : "normal")
                    .setGap(gapSize)
            ).asComponent()
        ),
    ]).setDefaultValues({
        [ "artwork-url" ]: restore?.[ "artwork-url" ]
    }).addValidator((thing) => thing.object({
        loading: thing.void(),
        [ "artwork-url" ]: thing.string()
    })),
    Page((formData) => [
        Spacer(),
        Horizontal(
            Spacer(),
            View(({ update }) =>
                Vertical(
                    CenterAndRight(
                        PlainText("Manage your Music").addClass("title"),
                        Button("Manual Upload")
                            .onClick(() => uploadFilesDialog((list) => addSongs(list, formData, update), allowedAudioFormats.join(",")))
                    ),
                    formData.getAll("song").filter(x => x).length ?
                        Table<TableData>(
                            TableDef(formData),
                            FormToRecord(formData, "song", [])
                                .map(x => ({ Id: x.id }))
                        )
                            .setDelete(({ Id }) => {
                                DeleteFromForm(formData, "song", (x) => x != Id);
                                update({});
                            })
                            .addClass("inverted-class", "light-mode")
                        : UploadTable(TableDef(formData), (list) => addSongs(list, formData, update))
                            .addClass("inverted-class", "light-mode")

                ).setGap(gapSize),
            ).asComponent(),
            Spacer()
        ),
    ]).setDefaultValues(restore?.song
        ? RecordToForm(new FormData(), "song", restore.song.map(x => ({
            id: x.Id,
            title: x.Title,
            country: x.Country,
            primaryGenre: x.PrimaryGenre,
            year: x.Year?.toString(),
            artists: x.Artists,
            file: x.File,
            explicit: x.Explicit ? "true" : "false"
        })))
        : {}
    ).addValidator((v) => v.object({
        loading: v.void(),
        song: v.string().or(v.array(v.string()))
    })),
    Page((formData) => [
        Spacer(),
        Horizontal(
            Spacer(),
            PlainText("Thanks! Thats everything we need.").addClass("ending-title"),
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
]);
function uploadArtwork(formData: FormData, file: File, update: (data: Partial<unknown>) => void) {
    formData.set("artwork-url", URL.createObjectURL(file));
    formData.set("loading", "-");
    update({});
    setTimeout(() => {
        const image = document.querySelector(".upload-image")!;
        StreamingUploadHandler({
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
                formData.set("artwork", id);
                formData.delete("loading");
                update({});
            },
            onUploadTick: async (percentage) => {
                const animation = image.animate([
                    { filter: "grayscale(1) blur(23px)", transform: "scale(0.6)" },
                    { filter: "grayscale(0) blur(0px)", transform: "scale(1)" },
                ], { duration: 100, fill: 'forwards' });
                animation.currentTime = percentage;
                animation.pause();
                await delay(10);
            },
            uploadDone: () => { }
        }, params.get("id")!, file);
    });
}

const lockedLoading = new Set();
function addSongs(list: File[], formData: FormData, update: (data: Partial<unknown>) => void) {
    list.map(x => ({ file: x, id: crypto.randomUUID() })).forEach(({ file, id }) => {
        formData.append("song", id);
        formData.set("loading", "-");
        lockedLoading.add(id);
        const cleanedUpTitle = file.name
            .replaceAll("_", " ")
            .replaceAll("-", " ")
            .replace(/\.[^/.]+$/, "");

        StreamingUploadHandler({
            prepare: () => {
                formData.set(`song-${id}-progress`, "0");
            },
            credentials: () => API.getToken(),
            backendResponse: (fileId) => {
                formData.set(`song-${id}-file`, fileId);
                formData.delete(`song-${id}-progress`);
                lockedLoading.delete(id);
                if (lockedLoading.size == 0)
                    formData.delete("loading");
                update({});
            },
            onUploadTick: async (percentage) => {
                formData.set(`song-${id}-progress`, percentage.toString());
                await delay(10);
                update({});
            },
            uploadDone: () => {

            }
        }, params.get("id")!, file);
        formData.set(`song-${id}-title`, cleanedUpTitle); // Our AI prediceted name
        formData.set(`song-${id}-year`, new Date().getFullYear().toString());
        // TODO Add Defaults for Country, Primary Genre => Access global FormData and merge it to one and then pull it
    });
    update({});
}

function ImageFrom(formData: FormData, key: string): Component {
    return Custom(img(formData.get(key)! as string));
}
