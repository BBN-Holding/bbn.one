import { API, uploadFilesDialog } from "shared";
import { AdvancedImage, Box, Button, ButtonStyle, Center, CenterV, Color, Custom, DropAreaInput, DropDownInput, Grid, Horizontal, Image, Label, MediaQuery, Page, Spacer, SupportedThemes, TextInput, Vertical, View, WebGen, Wizard, loadingWheel } from "webgen/mod.ts";
import '../../assets/css/main.css';
import { DynaNavigation } from "../../components/nav.ts";
import language from "../../data/language.json" assert { type: "json" };
import primary from "../../data/primary.json" assert { type: "json" };
import secondary from "../../data/secondary.json" assert { type: "json" };
import { ArtistTypes, Drop, DropType, pageFive, pageFour, pageOne, pageThree, pageTwo } from "../../spec/music.ts";
import { CenterAndRight, EditArtists, IsLoggedIn, ProfileData, RegisterAuthRefresh, allowedAudioFormats, allowedImageFormats, getDropFromPages, getSecondary } from "./helper.ts";
import { uploadArtwork, uploadSongToDrop } from "./music/data.ts";
import { ManageSongs } from "./music/table.ts";

import '../../assets/css/wizard.css';

await RegisterAuthRefresh();
WebGen({
    theme: SupportedThemes.dark
});

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
        update({ aboutMe: IsLoggedIn() ?? undefined });
        API.music(API.getToken()).id(dropId).get()
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

const wizard = (restore?: Drop) => Wizard({
    cancelAction: "/music",
    buttonArrangement: "space-between",
    submitAction: async (data) => {
        try {
            let obj = {};
            data.map(x => x.data.data).forEach(x => obj = { ...obj, ...x });

            // deno-lint-ignore no-explicit-any
            await API.music(API.getToken()).id(dropId).update(<any>obj);

            await API.music(API.getToken()).id(dropId).type.post(DropType.UnderReview);
            location.href = "/music";
        } catch (_) {
            alert("Unexpected Error happend while updating your Drop\nPlease try again later...");
        }
    },
    onNextPage: async ({ ResponseData }) => {
        const _data = await ResponseData();
        let obj = {};
        _data.map(x => x.success == true ? x.data : ({})).forEach(x => obj = { ...obj, ...x });
        try {
            // deno-lint-ignore no-explicit-any
            await API.music(API.getToken()).id(dropId).update(<any>obj);
        } catch (_) {
            alert("Unexpected Error happend while updating your Drop\nPlease try again later...");
        }
    }
}, ({ Next, PageData }) => [
    Page({
        upc: restore?.upc
    }, (state) => [
        Spacer(),
        MediaQuery(
            "(max-width: 500px)",
            (small) =>
                Label("Lets make your Drop hit!")
                    .setWidth(small ? "max(1rem, 15rem)" : "max(1rem, 25rem)")
                    .setFont(small ? 2 : 3.448125, 800),
        ),
        Spacer(),
        Horizontal(
            Spacer(),
            Vertical(
                Center(Label("Do you have an UPC/EAN number?").addClass("title")),
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
        .setValidator(() => pageOne),
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
                Center(Label("Enter your Album details.").addClass("title")),
                TextInput("text", "Title").sync(state, "title"),
                Grid(
                    TextInput("date", "Release Date", "live").sync(state, "release"),
                    DropDownInput("Language", Object.keys(language))
                        .setRender((key) => language[ <keyof typeof language>key ])
                        .sync(state, "language")
                )
                    .setEvenColumns(small ? 1 : 2)
                    .setGap(gapSize),
                // TODO: Make this a nicer component
                Button("Artists")
                    .onClick(() => {
                        EditArtists(state.artists ?? [ [ "", "", ArtistTypes.Primary ] ])
                            .then((x) => {
                                // deno-lint-ignore no-explicit-any
                                state.artists = <any>x?.map(x => x.map(x => x.trim()));
                            });
                    }),
                Center(Label("Set your target Audience").addClass("title")),
                Grid(
                    DropDownInput("Primary Genre", primary)
                        .sync(state, "primaryGenre")
                        .onChange(() => {
                            state.secondaryGenre = undefined;
                        }),
                    state.$primaryGenre.map(() =>
                        DropDownInput("Secondary Genre", getSecondary(secondary, state.primaryGenre) ?? [])
                            .sync(state, "secondaryGenre")
                            .setColor(getSecondary(secondary, state.primaryGenre) ? Color.Grayscaled : Color.Disabled)
                            .addClass("border-box")
                            .setWidth("100%")
                    ).asRefComponent(),
                )
                    .setGap(gapSize)
                    .setEvenColumns(small ? 1 : 2),
            )
                .setEvenColumns(1)
                .addClass("grid-area")
                .setGap(gapSize)
        ),
    ]).setValidator(() => pageTwo),
    Page({
        compositionCopyright: restore?.compositionCopyright ?? "BBN Music (via bbn.one)",
        soundRecordingCopyright: restore?.soundRecordingCopyright ?? "BBN Music (via bbn.one)"
    }, (state) => [
        Spacer(),
        Grid(
            Center(Label("Display the Copyright").addClass("title")),
            TextInput("text", "Composition Copyright").sync(state, "compositionCopyright"),
            TextInput("text", "Sound Recording Copyright").sync(state, "soundRecordingCopyright"),
        )
            .setEvenColumns(1)
            .addClass("grid-area")
            .setGap(gapSize)
    ]).setValidator(() => pageThree),
    Page({
        artwork: restore?.artwork,
        artworkClientData: <AdvancedImage | string | undefined>(restore?.artwork ? <AdvancedImage>{ type: "direct", source: () => API.music(API.getToken()).id(restore._id).artworkPreview() } : undefined),
        loading: false
    }, (data) => [
        Spacer(),
        Center(
            data.$artworkClientData.map(() => Vertical(
                CenterAndRight(
                    Label("Upload your Cover").addClass("title"),
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
            ).setGap(gapSize)).asRefComponent()
        ),
    ]).setValidator(() => pageFour),
    Page({
        uploadingSongs: <string[]>[],
        songs: restore?.songs ?? []
    }, (state) => [
        Spacer(),
        Horizontal(
            Spacer(),
            Vertical(
                CenterAndRight(
                    Label("Manage your Music").addClass("title"),
                    Button("Manual Upload")
                        .onClick(() => uploadFilesDialog((list) => uploadSongToDrop(state, getDropFromPages(PageData(), restore), list), allowedAudioFormats.join(",")))
                ),
                ManageSongs(state),
            ).setGap(gapSize),
            Spacer()
        ),
    ]).setValidator(() => pageFive),
    Page({
        comments: restore?.comments
    }, (state) => [
        Spacer(),
        Horizontal(
            Spacer(),
            Label("Thanks! That's everything we need.").addClass("ending-title"),
            Spacer(),
        ),
        Horizontal(
            Spacer(),
            TextInput("text", "Comments for Review Team").sync(state, "comments"),
            Spacer()
        ),
    ])
]);