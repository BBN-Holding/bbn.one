import { DynaNavigation } from "../../components/nav.ts";
import primary from "../../data/primary.json" assert { type: "json"};
import secondary from "../../data/secondary.json" assert { type: "json"};
import language from "../../data/language.json" assert { type: "json"};
import { View, WebGen, loadingWheel, Horizontal, PlainText, Center, Vertical, Spacer, Input, Button, ButtonStyle, SupportedThemes, Grid, MaterialIcons, Color, DropDownInput, Wizard, Page, Custom, DropAreaInput, CenterV } from "webgen/mod.ts";
import { TableData } from "./types.ts";
import { allowedAudioFormats, allowedImageFormats, CenterAndRight, EditArtists, GetCachedProfileData, MediaQuery, ProfileData, Redirect, RegisterAuthRefresh, syncFromData, Table, UploadTable, getSecondary } from "./helper.ts";
import { TableDef } from "./music/table.ts";
import { API, Drop } from "./RESTSpec.ts";
import '../../assets/css/wizard.css';
import '../../assets/css/main.css';
import { DeleteFromForm, FormToRecord, RecordToForm } from "./data.ts";
import { StreamingUploadHandler, uploadFilesDialog } from "./upload.ts";
import { delay } from "https://deno.land/std@0.140.0/async/delay.ts";
import { addSongs, ImageFrom } from "./music/data.ts";

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


// TODO: Input zu neuen FormComponents umlagern
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
        API.music(API.getToken())[ 'id' ](params.get("id")!).get().then(async restoreData => {
            if (restoreData.artwork) {
                const blob = await API.music(API.getToken()).id(params.get("id")!).artworkPreview();
                update({ restoreData: { ...restoreData, [ "artwork-url" ]: URL.createObjectURL(blob) } });
            }
            else update({ restoreData });
        }).catch((e) => {
            alert(e);
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
        try {

            await API
                .music(API.getToken())
                .id(params.get("id")!)
                .put(single);

        } catch (_error) {
            //TODO: Move this to a notification
            alert("Unexpected Error happend while updating your Drop\nPlease try again later...");
        }
    },
    submitAction: async () => {
        const single = new FormData();
        single.set("type", <Drop[ "type" ]>"UNDER_REVIEW");
        await API.music(API.getToken()).id(params.get("id")!).put(single);
        location.href = "/music";
    }
}, ({ Next, PageData }) => [
    Page((formData) => [
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
                Input({
                    ...syncFromData(formData, "upc"),
                    placeholder: "UPC/EAN"
                })
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
    ]).setDefaultValues({ upc: restore?.upc }),
    Page((formData) => [
        Spacer(),
        MediaQuery("(max-width: 450px)", (small) =>
            Grid(
                Center(PlainText("Enter your Album details.").addClass("title")),
                Input({
                    ...syncFromData(formData, "title"),
                    placeholder: "Title"
                }),
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
                        .addClass("justify-content-space")
                )
                    .setEvenColumns(small ? 1 : 2)
                    .setGap(gapSize),
                // TODO: Make this a nicer component
                Button("Artists")
                    .onClick(() => {
                        EditArtists(formData.get("artists") ? JSON.parse(formData.get("artists")!.toString()) : [ [ "", "", "PRIMARY" ] ]).then((x) => formData.set("artists", JSON.stringify(x)));
                    }),
                Center(PlainText("Set your target Audience").addClass("title")),
                View(({ update }) =>
                    Grid(
                        DropDownInput("Primary Genre", primary)
                            .syncFormData(formData, "primaryGenre")
                            .addClass("justify-content-space")
                            .onChange(() => {
                                formData.delete("secondaryGenre");
                                update({});
                            }),
                        DropDownInput("Secondary Genre", getSecondary(secondary, formData) ?? [])
                            .syncFormData(formData, "secondaryGenre")
                            .setColor(getSecondary(secondary, formData) ? Color.Grayscaled : Color.Disabled)
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
    ]).setDefaultValues({
        title: restore?.title,
        release: restore?.release,
        language: restore?.language,
        artists: JSON.stringify(restore?.artists),
        primaryGenre: restore?.primaryGenre,
        secondaryGenre: restore?.secondaryGenre
    }).addValidator((e) => e.object({
        title: e.string(),
        artists: e.string().or(e.array(e.string())),
        release: e.string(),
        language: e.string(),
        primaryGenre: e.string(),
        secondaryGenre: e.string()
    })),
    Page((formData) => [
        Spacer(),
        Grid(
            Center(PlainText("Display the Copyright").addClass("title")),
            Input({
                placeholder: "Composition Copyright",
                ...syncFromData(formData, "compositionCopyright")
            }),
            Input({
                placeholder: "Sound Recording Copyright",
                ...syncFromData(formData, "soundRecordingCopyright")
            }),
        )
            .setEvenColumns(1)
            .addClass("grid-area")
            .setGap(gapSize)
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
    ]).setDefaultValues(restore?.song
        ? RecordToForm(new FormData(), "song", restore.song.map(x => ({
            id: x.Id,
            isrc: x.ISRC,
            title: x.Title,
            country: x.Country,
            primaryGenre: x.PrimaryGenre,
            secondaryGenre: x.SecondaryGenre,
            year: x.Year?.toString(),
            artists: JSON.stringify(x.Artists),
            file: x.File,
            explicit: x.Explicit ? "true" : "false"
        })))
        : {}
    ).addValidator((v) => v.object({
        loading: v.void(),
        song: v.string().min(1).or(v.string().array().min(1))
    })),
    Page((formData) => [
        Spacer(),
        Horizontal(
            Spacer(),
            PlainText("Thanks! That's everything we need.").addClass("ending-title"),
            Spacer(),
        ),
        Horizontal(
            Spacer(),
            Input({
                placeholder: "Comments for Review Team",
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