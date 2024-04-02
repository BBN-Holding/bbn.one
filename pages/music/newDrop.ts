import { API, LoadingSpinner, stupidErrorAlert } from "shared/mod.ts";
import { AdvancedImage, asState, Body, Box, Button, ButtonStyle, Center, CenterV, Color, createFilePicker, Custom, DropAreaInput, DropDownInput, Empty, getErrorMessage, Grid, Horizontal, Image, Label, MediaQuery, SheetDialog, Spacer, SupportedThemes, TextInput, Validate, Vertical, WebGen } from "webgen/mod.ts";
import "../../assets/css/main.css";
import { DynaNavigation } from "../../components/nav.ts";
import genres from "../../data/genres.json" with { type: "json" };
import language from "../../data/language.json" with { type: "json" };
import { DropType, pages } from "../../spec/music.ts";
import { allowedAudioFormats, allowedImageFormats, CenterAndRight, EditArtistsDialog, getSecondary, RegisterAuthRefresh, sheetStack } from "../_legacy/helper.ts";
import { uploadArtwork, uploadSongToDrop } from "../_legacy/music/data.ts";
import { ManageSongs } from "../_legacy/music/table.ts";
import { creationState } from "./state.ts";
// Do no move this import
import { ArtistTypes } from "../../spec/music.ts";
import "./newDrop.css";

await RegisterAuthRefresh();

WebGen({
    theme: SupportedThemes.dark,
});

const params = new URLSearchParams(location.search);

if (!params.has("id")) {
    alert("ID is missing");
    location.href = "/c/music";
}
const dropId = params.get("id")!;

API.music.id(dropId).get().then(stupidErrorAlert)
    .then((drop) => {
        creationState._id = dropId;
        creationState.gtin = drop.gtin;
        creationState.title = drop.title;
        creationState.release = drop.release;
        creationState.language = drop.language;
        creationState.artists = asState(drop.artists ?? [{ type: ArtistTypes.Primary, _id: "123" }]);
        creationState.primaryGenre = drop.primaryGenre;
        creationState.secondaryGenre = drop.secondaryGenre;
        creationState.compositionCopyright = drop.compositionCopyright ?? "BBN Music (via bbn.one)";
        creationState.soundRecordingCopyright = drop.soundRecordingCopyright ?? "BBN Music (via bbn.one)";
        creationState.artwork = drop.artwork;
        creationState.artworkClientData = <AdvancedImage | undefined> (drop.artwork ? <AdvancedImage> { type: "direct", source: () => API.music.id(dropId).artwork().then(stupidErrorAlert) } : undefined);
        creationState.songs = asState(drop.songs ?? []);
        creationState.comments = drop.comments;
    })
    .then(() => creationState.loaded = true);

const additionalDropInformation = SheetDialog(
    sheetStack,
    "Additional Information",
    Vertical(
        Grid(
            TextInput("text", "UPC/EAN").sync(creationState, "gtin"),
            TextInput("text", "Composition Copyright").sync(creationState, "compositionCopyright"),
            TextInput("text", "Sound Recording Copyright").sync(creationState, "soundRecordingCopyright"),
        )
            .setEvenColumns(1)
            .addClass("grid-area")
            .setGap(),
        //only for the user exp
        Horizontal(Spacer(), Button("Save").onClick(() => additionalDropInformation.close())),
    ).setGap(),
);

sheetStack.setDefault(Vertical(
    DynaNavigation("Music"),
    creationState.$loaded.map((loaded) => loaded ? wizard : LoadingSpinner()).asRefComponent(),
));

Body(sheetStack)
    .addClass("fullscreen");
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
    Horizontal(
        page == 0 ? Button("Cancel").setJustifyContent("center").setStyle(ButtonStyle.Secondary).onClick(() => location.href = "/c/music") : Button("Back").setJustifyContent("center").setStyle(ButtonStyle.Secondary).onClick(() => creationState.page--),
        Spacer(),
        Box(
            creationState.$validationState.map((error) =>
                error
                    ? CenterV(
                        Label(getErrorMessage(error))
                            .addClass("error-message")
                            .setMargin("0 0.5rem 0 0"),
                    )
                    : Empty()
            ).asRefComponent(),
        ),
        Button("Next").setJustifyContent("center").onClick(validator(page)),
    ).addClass("footer");

const wizard = creationState.$page.map((page) => {
    if (page == 0) {
        return Vertical(
            Spacer(),
            MediaQuery("(max-width: 450px)", (small) =>
                Grid(
                    Center(Label("Enter your Album details.").addClass("title")),
                    TextInput("text", "Title").sync(creationState, "title"),
                    Grid(
                        TextInput("date", "Release Date", "live").sync(creationState, "release"),
                        DropDownInput("Language", Object.keys(language))
                            .setRender((key) => language[<keyof typeof language> key])
                            .sync(creationState, "language"),
                    )
                        .setEvenColumns(small ? 1 : 2)
                        .setGap(),
                    Button("Artists")
                        .onClick(() => EditArtistsDialog(creationState).open()),
                    Center(Label("Set your target Audience").addClass("title")),
                    Grid(
                        DropDownInput("Primary Genre", Object.keys(genres))
                            .sync(creationState, "primaryGenre")
                            .onChange(() => creationState.secondaryGenre = undefined),
                        creationState.$primaryGenre.map(() =>
                            DropDownInput("Secondary Genre", getSecondary(genres, creationState.primaryGenre) ?? [])
                                .sync(creationState, "secondaryGenre")
                                .setColor(getSecondary(genres, creationState.primaryGenre) ? Color.Grayscaled : Color.Disabled)
                                .addClass("border-box")
                                .setWidth("100%")
                        ).asRefComponent(),
                    )
                        .setGap()
                        .setEvenColumns(small ? 1 : 2),
                    Button("Additional Information")
                        .onClick(() => additionalDropInformation.open()),
                )
                    .setEvenColumns(1)
                    .addClass("grid-area")
                    .setGap()),
            Spacer(),
            footer(page),
        ).addClass("wwizard");
    } else if (page == 1) {
        return Vertical(
            Spacer(),
            Center(
                creationState.$artworkClientData.map((data) =>
                    Vertical(
                        CenterAndRight(
                            Label("Upload your Cover").addClass("title"),
                            Button("Manual Upload")
                                .onClick(() => createFilePicker(allowedImageFormats.join(",")).then((file) => uploadArtwork(dropId, file, creationState.$artworkClientData, creationState.$loading, creationState.$artwork))),
                        ),
                        DropAreaInput(
                            CenterV(data ? Image(data, "A Music Album Artwork.") : Label("Drop your Artwork here.").setTextSize("xl").setFontWeight("semibold")),
                            allowedImageFormats,
                            ([{ file }]) => uploadArtwork(dropId, file, creationState.$artworkClientData, creationState.$loading, creationState.$artwork),
                        ).addClass("drop-area"),
                    ).setGap()
                ).asRefComponent(),
            ),
            Spacer(),
            footer(page),
        ).addClass("wwizard");
    } else if (page == 2) {
        return Vertical(
            Spacer(),
            Horizontal(
                Spacer(),
                Vertical(
                    CenterAndRight(
                        Label("Manage your Music").addClass("title"),
                        Button("Manual Upload")
                            .onClick(() => createFilePicker(allowedAudioFormats.join(",")).then((file) => uploadSongToDrop(creationState, creationState.$uploadingSongs, file))),
                    ),
                    ManageSongs(creationState),
                ).setGap(),
                Spacer(),
            ),
            Spacer(),
            footer(page),
        ).addClass("wwizard");
    } else if (page == 3) {
        return Vertical(
            Spacer(),
            Horizontal(
                Spacer(),
                Label("Thanks! That's everything we need.").setBalanced().addClass("ending-title"),
                Spacer(),
            ),
            Horizontal(
                Spacer(),
                TextInput("text", "Comments for Review Team").sync(creationState, "comments"),
                Spacer(),
            ),
            Spacer(),
            Horizontal(
                Button("Back").setJustifyContent("center").setStyle(ButtonStyle.Secondary).onClick(() => creationState.page--),
                Spacer(),
                Button("Submit").setJustifyContent("center").onPromiseClick(async () => {
                    creationState.loaded = false;
                    await API.music.id(dropId).update(creationState);

                    await API.music.id(dropId).type.post(DropType.UnderReview);
                    location.href = "/c/music";
                }),
            ).addClass("footer"),
        ).addClass("wwizard");
    }
    return LoadingSpinner();
}).asRefComponent();
