import { allowedAudioFormats, allowedImageFormats, CenterAndRight, ExistingSongDialog, getSecondary, RegisterAuthRefresh, sheetStack } from "shared/helper.ts";
import { API, stupidErrorAlert } from "shared/mod.ts";
import { appendBody, asRef, asRefRecord, Box, Content, createFilePicker, DialogContainer, DropDown, Empty, Grid, Image, Label, PrimaryButton, SecondaryButton, SheetHeader, Spinner, TextInput, WebGenTheme } from "webgen/mod.ts";
import "../../assets/css/main.css";
import { DynaNavigation } from "../../components/nav.ts";
import genres from "../../data/genres.json" with { type: "json" };
import language from "../../data/language.json" with { type: "json" };
import { ArtistRef, ArtistTypes, DropType, pages, Song } from "../../spec/music.ts";
import { uploadArtwork, uploadSongToDrop } from "./data.ts";
import { EditArtistsDialog, ManageSongs } from "./views/table.ts";

// Do no move this import
import "./newDrop.css";

await RegisterAuthRefresh();

// Because this is a mix of light and dark mode we force dropdowns to be dark
document.querySelector(".wpopover")?.setAttribute("data-theme", "dark");

const params = new URLSearchParams(location.search);

if (!params.has("id")) {
    alert("ID is missing");
    location.href = "/c/music";
}
const dropId = params.get("id")!;

export const creationState = asRefRecord({
    loaded: false,
    _id: <string | undefined> undefined,
    gtin: <string | undefined> undefined,
    title: <string | undefined> undefined,
    release: <string | undefined> undefined,
    language: <string | undefined> undefined,
    artists: <ArtistRef[]> [],
    primaryGenre: <string | undefined> undefined,
    secondaryGenre: <string | undefined> undefined,
    compositionCopyright: <string | undefined> undefined,
    soundRecordingCopyright: <string | undefined> undefined,
    artwork: <string | undefined> undefined,
    artworkClientData: <AdvancedImage | undefined> undefined,
    uploadingSongs: <Record<string, number>[]> [],
    songs: <Song[]> [],
    comments: <string | undefined> undefined,
    page: 0,
    validationState: <zod.ZodError | undefined> undefined,
});

API.music.id(dropId).get().then(stupidErrorAlert)
    .then((drop) => {
        creationState._id = dropId;
        creationState.gtin = drop.gtin;
        creationState.title = drop.title;
        creationState.release = drop.release;
        creationState.language = drop.language;
        creationState.artists = drop.artists ?? [{ type: ArtistTypes.Primary, _id: null! }];
        creationState.primaryGenre = drop.primaryGenre;
        creationState.secondaryGenre = drop.secondaryGenre;
        creationState.compositionCopyright = drop.compositionCopyright ?? "BBN Music (via bbn.one)";
        creationState.soundRecordingCopyright = drop.soundRecordingCopyright ?? "BBN Music (via bbn.one)";
        creationState.artwork = drop.artwork;
        creationState.artworkClientData = <AdvancedImage | undefined> (drop.artwork ? <AdvancedImage> { type: "direct", source: () => API.music.id(dropId).artwork().then(stupidErrorAlert) } : undefined);
        creationState.songs = drop.songs ?? [];
        creationState.comments = drop.comments;
    })
    .then(() => creationState.loaded = true);

const additionalDropInformation = Grid(
    SheetHeader("Additional Information", sheetStack),
    Grid(
        Grid(
            TextInput(creationState.gtin, "UPC/EAN"),
            TextInput(creationState.compositionCopyright, "Composition Copyright"),
            TextInput(creationState.soundRecordingCopyright, "Sound Recording Copyright"),
        )
            .setGap()
            .setEvenColumns(1)
            .addClass("grid-area"),
        PrimaryButton("Save").onClick(() => sheetStack.removeOne()),
    ).setGap(),
);

appendBody(
    WebGenTheme(
        DialogContainer(sheetStack.visible(), sheetStack),
        Content(
            DynaNavigation("Music"),
            Box(creationState.loaded.map((loaded) => loaded ? wizard : Spinner())),
        ),
    ).addClass("fullscreen"),
);

Custom(document.body).setAttribute("data-theme", undefined);

const validator = (page: number) => async () => {
    const { error, validate } = Validate(creationState, pages[page]);

    const data = validate();
    if (error.getValue()) return creationState.validationState = error.getValue();
    if (data) await API.music.id(dropId).update(data);
    creationState.page++;
    creationState.validationState = undefined;
};

const footer = (page: number) =>
    Grid(
        page == 0 ? SecondaryButton("Cancel").setJustifyContent("center").onClick(() => location.href = "/c/music") : SecondaryButton("Back").setJustifyContent("center").onClick(() => creationState.page--),
        Box(
            creationState.validationState.map((error) =>
                error
                    ? CenterV(
                        Label(getErrorMessage(error))
                            .addClass("error-message")
                            .setMargin("0 0.5rem 0 0"),
                    )
                    : Empty()
            ),
        ),
        PrimaryButton("Next").setJustifyContent("center").onClick(validator(page)),
    ).addClass("footer");

const wizard = creationState.page.map((page) => {
    if (page == 0) {
        return Grid(
            MediaQuery("(max-width: 450px)", (small) =>
                Grid(
                    Label("Enter your Album details.").addClass("title"),
                    TextInput(creationState.title, "Title"),
                    Grid(
                        TextInput(creationState.release, "Release Date"),
                        DropDown(Object.keys(language), creationState.language, "Language")
                            .setValueRender((key) => language[<keyof typeof language> key]),
                    )
                        .setEvenColumns(small ? 1 : 2)
                        .setGap(),
                    PrimaryButton("Artists")
                        .onClick(() => EditArtistsDialog(creationState.artists).open()),
                    Label("Set your target Audience").addClass("title"),
                    Grid(
                        DropDown(Object.keys(genres), creationState.primaryGenre, "Primary Genre"),
                        // .onChange(() => creationState.secondaryGenre.setValue(undefined)), //move to listen
                        Box(creationState.primaryGenre.map((primaryGenre) =>
                            DropDown(getSecondary(genres, primaryGenre) ?? [], creationState.secondaryGenre, "Secondary Genre")
                                .setColor(getSecondary(genres, primaryGenre) ? Color.Grayscaled : Color.Disabled)
                        )),
                    )
                        .setGap()
                        .setEvenColumns(small ? 1 : 2),
                    PrimaryButton("Additional Information")
                        .onClick(() => sheetStack.addSheet(additionalDropInformation)),
                )
                    .setGap()
                    .setEvenColumns(1)
                    .addClass("grid-area")),
            footer(page),
        ).addClass("wwizard");
    } else if (page == 1) {
        return Grid(
            creationState.artworkClientData.map((data) =>
                Grid(
                    CenterAndRight(
                        Label("Upload your Cover").addClass("title"),
                        PrimaryButton("Manual Upload")
                            .onClick(() => createFilePicker(allowedImageFormats.join(",")).then((file) => uploadArtwork(dropId, file, creationState.artworkClientData, creationState.artwork))),
                    ),
                    DropAreaInput(
                        CenterV(data ? Image(data, "A Music Album Artwork.") : Label("Drop your Artwork here.").setTextSize("xl").setFontWeight("semibold")),
                        allowedImageFormats,
                        ([{ file }]) => uploadArtwork(dropId, file, creationState.artworkClientData, creationState.artwork),
                    ).addClass("drop-area"),
                ).setGap()
            ),
            footer(page),
        ).addClass("wwizard");
    } else if (page == 2) {
        creationState.songs.listen((songs, oldVal) => {
            if (oldVal != undefined) {
                creationState.songs.setValue(songs);
            }
        });
        const songs = asRef(<undefined | Song[]> undefined);
        const existingSongDialog = ExistingSongDialog(creationState.songs, songs);
        return Grid(
            Grid(
                Grid(
                    CenterAndRight(
                        Label("Manage your Music").addClass("title"),
                        Box(
                            PrimaryButton("Manual Upload")
                                .onClick(() => createFilePicker(allowedAudioFormats.join(",")).then((file) => uploadSongToDrop(creationState.songs, creationState.artists, creationState.language, creationState.primaryGenre, creationState.secondaryGenre, creationState.uploadingSongs, file))).setMargin("0 1rem 0 0"),
                            PrimaryButton("Add an existing Song")
                                .onPromiseClick(async () => {
                                    songs.setValue((await API.music.songs.list().then(stupidErrorAlert)).filter((song) => creationState.songs.value.some((dropsong) => dropsong._id !== song._id)));
                                    existingSongDialog.open();
                                }),
                        ),
                    ),
                    ManageSongs(creationState.songs, creationState.uploadingSongs, creationState.primaryGenre!),
                ).setGap(),
            ),
            footer(page),
        ).addClass("wwizard");
    } else if (page == 3) {
        return Grid(
            Grid(
                Label("Thanks! That's everything we need.").setBalanced().addClass("ending-title"),
            ),
            Grid(
                TextInput(creationState.comments, "Comments for Review Team"),
            ),
            Grid(
                SecondaryButton("Back").setJustifyContent("center").onClick(() => creationState.page--),
                PrimaryButton("Submit").onPromiseClick(async () => {
                    creationState.loaded = false;
                    await API.music.id(dropId).update(creationState);

                    await API.music.id(dropId).type.post(DropType.UnderReview);
                    location.href = "/c/music";
                }).setJustifyContent("center"),
            ).addClass("footer"),
        ).addClass("wwizard");
    }
    return Spinner();
});
