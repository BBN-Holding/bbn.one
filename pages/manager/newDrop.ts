import { DynaNavigation } from "../../components/nav.ts";
import primary from "../../data/primary.json" assert { type: "json"};
import secondary from "../../data/secondary.json" assert { type: "json"};
import language from "../../data/language.json" assert { type: "json"};
import { View, WebGen, loadingWheel, Horizontal, PlainText, Center, Vertical, Spacer, TextInput, Button, ButtonStyle, SupportedThemes, Grid, MaterialIcons, Color, DropDownInput, Wizard, Page, Custom, DropAreaInput, CenterV, Box, MediaQuery, Image, AdvancedImage, Reactive, StateHandler } from "webgen/mod.ts";
import { allowedAudioFormats, allowedImageFormats, CenterAndRight, EditArtists, GetCachedProfileData, ProfileData, Redirect, RegisterAuthRefresh, getSecondary } from "./helper.ts";
import { API, Drop } from "./RESTSpec.ts";
import '../../assets/css/wizard.css';
import '../../assets/css/main.css';
import { uploadFilesDialog } from "./upload.ts";
import * as musicSpec from "../../spec/music.ts";
import { ManageSongs } from "./music/table.ts";
import { uploadArtwork, uploadSongToDrop } from "./music/data.ts";

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
const wizard = (restore: Drop) => Wizard({
    cancelAction: "/music",
    buttonArrangement: "space-between",
    submitAction: async () => {
        const single = new FormData();
        single.set("type", <Drop[ "type" ]>"UNDER_REVIEW");
        await API.music(API.getToken()).id(params.get("id")!).put(single);
        location.href = "/music";
    },
    onNextPage: async ({ ResponseData }) => {
        const data = await ResponseData();

    }
}, ({ Next, PageData }) => [
    Page({
        upc: restore.upc
    }, (state) => [
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
                TextInput("text", "UPC/EAN").sync(state, "upc")
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
        .setValidator(() => musicSpec.pageOne),
    Page({
        title: restore?.title,
        release: restore?.release,
        language: restore?.language,
        artists: restore?.artists,
        primaryGenre: restore?.primaryGenre,
        secondaryGenre: restore?.secondaryGenre
    }, (state) => [
        Spacer(),
        MediaQuery("(max-width: 450px)", (small) =>
            Grid(
                Center(PlainText("Enter your Album details.").addClass("title")),
                TextInput("text", "Title").sync(state, "title"),
                Grid(
                    TextInput("date", "Release Date").sync(state, "release"),
                    DropDownInput("Language", language)
                        .sync(state, "language")
                        .addClass("justify-content-space")
                )
                    .setEvenColumns(small ? 1 : 2)
                    .setGap(gapSize),
                // TODO: Make this a nicer component
                Button("Artists")
                    .onClick(() => {
                        EditArtists(state.artists ?? [ [ "", "", "PRIMARY" ] ])
                            .then((x) => {
                                console.log(x);
                                // deno-lint-ignore no-explicit-any
                                state.artists = <any>x?.map(x => x.map(x => x.trim()));
                                console.log(JSON.parse(JSON.stringify(state)));
                            });
                    }),
                Center(PlainText("Set your target Audience").addClass("title")),
                Grid(
                    DropDownInput("Primary Genre", primary)
                        .sync(state, "primaryGenre")
                        .addClass("justify-content-space")
                        .onChange(() => {
                            state.secondaryGenre = undefined;
                        }),
                    DropDownInput("Secondary Genre", getSecondary(secondary, state.primaryGenre) ?? [])
                        .sync(state, "secondaryGenre")
                        .setColor(getSecondary(secondary, state.primaryGenre) ? Color.Grayscaled : Color.Disabled)
                        .addClass("justify-content-space"),
                )
                    .setGap(gapSize)
                    .setEvenColumns(small ? 1 : 2),
            )
                .setEvenColumns(1)
                .addClass("grid-area")
                .setGap(gapSize)
        ),
    ]).setValidator(() => musicSpec.pageTwo),
    Page({
        compositionCopyright: restore?.compositionCopyright,
        soundRecordingCopyright: restore?.soundRecordingCopyright
    }, (state) => [
        Spacer(),
        Grid(
            Center(PlainText("Display the Copyright").addClass("title")),
            TextInput("text", "Composition Copyright").sync(state, "compositionCopyright"),
            TextInput("text", "Sound Recording Copyright").sync(state, "soundRecordingCopyright"),
        )
            .setEvenColumns(1)
            .addClass("grid-area")
            .setGap(gapSize)
    ]).setValidator(() => musicSpec.pageThree),
    Page({
        artwork: restore?.artwork,
        artworkClientData: <AdvancedImage | string | undefined>(restore?.artwork ? <AdvancedImage>{ type: "direct", source: () => API.music(API.getToken()).id(restore._id).artworkPreview() } : undefined),
        loading: false
    }, (data) => [
        Spacer(),
        Center(
            Reactive(data, "artworkClientData", () => Vertical(
                CenterAndRight(
                    PlainText("Upload your Cover").addClass("title"),
                    Button("Manual Upload")
                        .onClick(() => uploadFilesDialog(([ file ]) => {
                            uploadArtwork(data, file);
                        }, allowedImageFormats.join(",")))
                ),
                DropAreaInput(
                    CenterV(data.artworkClientData ? Image(data.artworkClientData, "A Music Album Artwork.") : Box()),
                    allowedImageFormats,
                    ([ { file } ]) => uploadArtwork(data, file)
                ).addClass("drop-area")
            ).setGap(gapSize))
        ),
    ]).setValidator(() => musicSpec.pageFour),
    Page({
        uploadingSongs: <string[]>[],
        songs: restore?.songs,
        test: 0,
    }, (state) => [
        Spacer(),
        Horizontal(
            Spacer(),
            Vertical(
                CenterAndRight(
                    PlainText("Manage your Music").addClass("title"),
                    Button("Manual Upload")
                        .onClick(() => uploadFilesDialog((list) => uploadSongToDrop(state, getDropFromPages(PageData(), restore), list), allowedAudioFormats.join(",")))
                ),
                ManageSongs(state),
            ).setGap(gapSize),
            Spacer()
        ),
    ]).setValidator(() => musicSpec.pageFive),
    Page({
        comments: restore?.comments
    }, (state) => [
        Spacer(),
        Horizontal(
            Spacer(),
            PlainText("Thanks! That's everything we need.").addClass("ending-title"),
            Spacer(),
        ),
        Horizontal(
            Spacer(),
            TextInput("text", "Comments for Review Team").sync(state, "comments"),
            Spacer()
        ),
    ])
]);

function getDropFromPages(data: StateHandler<any>[], restore: Drop): Drop {
    return <Drop>{
        ...restore,
        ...data
    };
}
