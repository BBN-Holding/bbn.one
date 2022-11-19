import { DynaNavigation } from "../../components/nav.ts";
import primary from "../../data/primary.json" assert { type: "json"};
import secondary from "../../data/secondary.json" assert { type: "json"};
import language from "../../data/language.json" assert { type: "json"};
import { View, WebGen, loadingWheel, Horizontal, PlainText, Center, Vertical, Spacer, TextInput, Button, ButtonStyle, SupportedThemes, Grid, MaterialIcons, Color, DropDownInput, Wizard, Page, Custom, DropAreaInput, CenterV, Box, img, Component, MediaQuery, ReCache, Table } from "webgen/mod.ts";
import { TableData } from "./types.ts";
import { allowedAudioFormats, allowedImageFormats, CenterAndRight, EditArtists, GetCachedProfileData, ProfileData, Redirect, RegisterAuthRefresh, UploadTable, getSecondary } from "./helper.ts";
import { TableDef } from "./music/table.ts";
import { API, Drop } from "./RESTSpec.ts";
import '../../assets/css/wizard.css';
import '../../assets/css/main.css';
import { DeleteFromForm, FormToRecord } from "./data.ts";
import { StreamingUploadHandler, uploadFilesDialog } from "./upload.ts";
import { delay } from "https://deno.land/std@0.140.0/async/delay.ts";
import { addSongs, ImageFrom } from "./music/data.ts";
import { MusicPageFive, MusicPageFour, MusicPageOne, MusicPageThree, MusicPageTwo } from "./music/validation.ts";

WebGen({
    theme: SupportedThemes.dark,
    icon: new MaterialIcons()
});
Redirect();
await RegisterAuthRefresh();
const params = new URLSearchParams(location.search);

if (!params.has("id")) {
    alert("ID is missing");
    location.href = "/music";
}
const dropId = params.get("id")!;
const gapSize = "15px";
const inputWidth = "436px";


View<{ restoreData: Drop, aboutMe: ProfileData; }>(({ state }) => Vertical(
    ...DynaNavigation("Music", state.aboutMe),
    state.restoreData == null
        ? (() => {
            return CenterV(
                Center(
                    Custom(loadingWheel() as Element as HTMLElement)
                ).addClass("loading"),
                Spacer()
            ).addClass("wwizard");
        })()
        : wizard(state.restoreData).addClass("wizard-box")
))
    .change(({ update }) => {
        update({ aboutMe: GetCachedProfileData() });
        API.music(API.getToken())[ 'id' ](params.get("id")!).get()
            .then(restoreData => {
                update({ restoreData });
            })
            .catch((e) => {
                alert(e);
                setTimeout(() => location.reload(), 1000);
            });
    })
    .addClass("fullscreen")
    .appendOn(document.body);

// TODO: This should be put into the validators
// const nextAction: async (pages) => {
//     const single = new FormData();
//     const list = pages.map(x => Array.from(x.data.entries())).flat();
//     for (const [ key, value ] of list) {
//         single.append(key, value);
//     }
//     try {

//         await API
//             .music(API.getToken())
//             .id(params.get("id")!)
//             .put(single);

//     } catch (_error) {
//         //TODO: Move this to a notification
//         alert("Unexpected Error happend while updating your Drop\nPlease try again later...");
//     }
// };
const wizard = (restore?: Drop) => Wizard({
    cancelAction: "/music",
    buttonArrangement: "space-between",
    submitAction: async () => {
        const single = new FormData();
        single.set("type", <Drop[ "type" ]>"UNDER_REVIEW");
        await API.music(API.getToken()).id(params.get("id")!).put(single);
        location.href = "/music";
    }
}, ({ Next, PageData }) => [
    Page({
        upc: restore?.upc
    }, (formData) => [
        Spacer(),
        MediaQuery(
            "(max-width: 500px)",
            (small) =>
                PlainText("Lets make your Drop hit!")
                    .setWidth(small ? "max(1rem, 15rem)" : "max(1rem, 25rem)")
                    .setFont(small ? 2 : 3.448125, 800),
        ),
        Spacer(),
        Horizontal(
            Spacer(),
            Vertical(
                Center(PlainText("Do you have an UPC/EAN number?").addClass("title")),
                TextInput("text", "UPC/EAN").sync(formData, "upc")
                    .setWidth(inputWidth)
                    .addClass("max-width"),
                Button("No, I don't have one.")
                    .setJustify("center")
                    .addClass("max-width")
                    .setStyle(ButtonStyle.Secondary)
                    .onClick(Next)
            ).setGap(gapSize),
            Spacer()
        ),
        Spacer(),
    ])
        .setValidator(MusicPageOne),
    Page({
        title: restore?.title,
        release: restore?.release,
        language: restore?.language,
        artists: JSON.stringify(restore?.artists),
        primaryGenre: restore?.primaryGenre,
        secondaryGenre: restore?.secondaryGenre
    }, (formData) => [
        Spacer(),
        MediaQuery("(max-width: 450px)", (small) =>
            Grid(
                Center(PlainText("Enter your Album details.").addClass("title")),
                TextInput("text", "Title").sync(formData, "title"),
                Grid(
                    TextInput("date", "Release Date").sync(formData, "release"),
                    DropDownInput("Language", language)
                        .sync(formData, "language")
                        .addClass("justify-content-space")
                )
                    .setEvenColumns(small ? 1 : 2)
                    .setGap(gapSize),
                // TODO: Make this a nicer component
                Button("Artists")
                    .onClick(() => {
                        EditArtists(formData.get("artists")
                            ? JSON.parse(formData.get("artists")!.toString())
                            : [ [ "", "", "PRIMARY" ] ])
                            .then((x) => formData.set("artists", JSON.stringify(x?.map(x => x.map(x => x.trim())))));
                    }),
                Center(PlainText("Set your target Audience").addClass("title")),
                View(({ update }) =>
                    Grid(
                        DropDownInput("Primary Genre", primary)
                            .sync(formData, "primaryGenre")
                            .addClass("justify-content-space")
                            .onChange(() => {
                                formData.delete("secondaryGenre");
                                update({});
                            }),
                        DropDownInput("Secondary Genre", getSecondary(secondary, formData.primaryGenre) ?? [])
                            .sync(formData, "secondaryGenre")
                            .setColor(getSecondary(secondary, formData.primaryGenre) ? Color.Grayscaled : Color.Disabled)
                            .addClass("justify-content-space"),
                    )
                        .setGap(gapSize)
                        .setEvenColumns(small ? 1 : 2)
                ).asComponent(),
            )
                .setEvenColumns(1)
                .addClass("grid-area")
                .setGap(gapSize)
        ),
    ]).setValidator(MusicPageTwo),
    Page({
        compositionCopyright: restore?.compositionCopyright,
        soundRecordingCopyright: restore?.soundRecordingCopyright
    }, (formData) => [
        Spacer(),
        Grid(
            Center(PlainText("Display the Copyright").addClass("title")),
            TextInput("text", "Composition Copyright").sync(formData, "compositionCopyright"),
            TextInput("text", "Sound Recording Copyright").sync(formData, "soundRecordingCopyright"),
        )
            .setEvenColumns(1)
            .addClass("grid-area")
            .setGap(gapSize)
    ]).setValidator(MusicPageThree),
    Page({
        artwork: restore?.artwork,
        "artwork-url": undefined,
    }, (formData) => [
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
                    DropAreaInput(CenterV(ImagePreview(formData)), allowedImageFormats, ([ { file } ]) => {
                        uploadArtwork(formData, file, update);
                    }).addClass("drop-area"),
                    Custom(loadingWheel() as Element as HTMLElement)
                )
                    .addClass(formData.has("loading") ? "loading" : "normal")
                    .setGap(gapSize)
            ).asComponent()
        ),
    ]).setValidator(MusicPageFour),
    Page({
        song: restore?.song
    }, (formData) => [
        Spacer(),
        Horizontal(
            Spacer(),
            View(({ update }) =>
                Vertical(
                    CenterAndRight(
                        PlainText("Manage your Music").addClass("title"),
                        Button("Manual Upload")
                            .onClick(() => uploadFilesDialog((list) => addSongs(dropId, PageData, list, formData, update), allowedAudioFormats.join(",")))
                    ),
                    formData.getAll("song").filter(x => x).length ?
                        Table<TableData>(
                            TableDef(formData, update),
                            FormToRecord(formData, "song", [])
                                .map(x => ({ Id: x.id }))
                        )
                            .setDelete(({ Id }) => {
                                DeleteFromForm(formData, "song", (x) => x != Id);
                                update({});
                            })
                            .addClass("inverted-class", "light-mode")
                        : UploadTable(TableDef(formData, update), (list) => addSongs(dropId, PageData, list, formData, update))
                            .addClass("inverted-class", "light-mode")

                ).setGap(gapSize),
            ).asComponent(),
            Spacer()
        ),
    ]).setValidator(MusicPageFive),
    Page({
        comments: restore?.comments
    }, (formData) => [
        Spacer(),
        Horizontal(
            Spacer(),
            PlainText("Thanks! That's everything we need.").addClass("ending-title"),
            Spacer(),
        ),
        Horizontal(
            Spacer(),
            TextInput("text", "Comments for Review Team").sync(formData, "comments"),
            Spacer()
        ),
    ])
]);

function ImagePreview(formData: FormData): Component {
    if (formData.has("artwork") && !formData.has("artwork-url"))
        return ReCache("artwork",
            () => API.music(API.getToken()).id(params.get("id")!).artworkPreview().then(x => URL.createObjectURL(x)),
            (type, data) => type == "cache" ? LoadingBox() : Custom(img(data))
        )
            .addClass("image-source");

    if (formData.has("artwork") || formData.has("loading"))
        return ImageFrom(formData, "artwork-url").addClass("upload-image");

    return PlainText("Drag & Drop your File here");
}

function LoadingBox(): Component {
    return Box(Custom(loadingWheel() as Element as HTMLElement));
}

function uploadArtwork(formData: FormData, file: File, update: (data: Partial<unknown>) => void) {
    formData.set("artwork-url", URL.createObjectURL(file));
    formData.set("loading", "-");
    update({});
    setTimeout(() => {
        const image = document.querySelector(".upload-image")!;
        StreamingUploadHandler(`music/${params.get("id")!}/upload`, {
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
                await delay(5);
            },
            uploadDone: () => { },
            failure: () => {
                formData.delete("loading");
                formData.delete("artwork");
                formData.delete("artwork-url");
                alert("Your Upload has failed. Please try a different file or try again later");
                update({});
            }
        }, file);
    });
}