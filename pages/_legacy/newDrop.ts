import { ZodError } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { API, LoadingSpinner, stupidErrorAlert } from "shared/mod.ts";
import { AdvancedImage, Body, Box, Button, ButtonStyle, Center, CenterV, Color, DropAreaInput, DropDownInput, Empty, Grid, Horizontal, Image, Label, MediaQuery, Spacer, SupportedThemes, TextInput, Validate, Vertical, WebGen, asState, createFilePicker, getErrorMessage } from "webgen/mod.ts";
import '../../assets/css/main.css';
import { DynaNavigation } from "../../components/nav.ts";
import genres from "../../data/genres.json" with { type: "json" };
import language from "../../data/language.json" with { type: "json" };
import { Artist, DropType, Song, pages } from "../../spec/music.ts";
import '../hosting/views/table2.css';
import { CenterAndRight, EditArtistsDialog, RegisterAuthRefresh, allowedAudioFormats, allowedImageFormats, getSecondary, sheetStack } from "./helper.ts";
import { uploadArtwork, uploadSongToDrop } from "./music/data.ts";
import { ManageSongs } from "./music/table.ts";
// Do no move this import
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

API.music.id(dropId).get().then(stupidErrorAlert)
    .then(drop => {
        state.upc = drop.upc;
        state.title = drop.title;
        state.release = drop.release;
        state.language = drop.language;
        state.artists = asState(drop.artists ?? []);
        state.primaryGenre = drop.primaryGenre;
        state.secondaryGenre = drop.secondaryGenre;
        state.compositionCopyright = drop.compositionCopyright;
        state.soundRecordingCopyright = drop.soundRecordingCopyright;
        state.artwork = drop.artwork;
        state.artworkClientData = <AdvancedImage | string | undefined>(drop.artwork ? <AdvancedImage>{ type: "direct", source: () => API.music.id(dropId).artwork().then(stupidErrorAlert) } : undefined);
        state.songs = asState(drop.songs ?? []);
        state.comments = drop.comments;
    })
    .then(() => state.loaded = true);

const state = asState({
    loaded: false,
    _id: dropId,
    upc: <string | undefined | null>undefined,
    title: <string | undefined>undefined,
    release: <string | undefined>undefined,
    language: <string | undefined>undefined,
    artists: <Artist[]>[],
    primaryGenre: <string | undefined>undefined,
    secondaryGenre: <string | undefined>undefined,
    compositionCopyright: <string | undefined>undefined,
    soundRecordingCopyright: <string | undefined>undefined,
    artwork: <string | undefined>undefined,
    artworkClientData: <AdvancedImage | string | undefined>undefined,
    loading: false,
    uploadingSongs: <string[]>[],
    songs: <Song[]>[],
    comments: <string | undefined>undefined,
    page: 0,
    validationState: <ZodError | undefined>undefined
});

sheetStack.setDefault(Vertical(
    DynaNavigation("Music"),
    state.$loaded.map(loaded => loaded ?
        wizard.addClass("wizard-box")
        : LoadingSpinner()
    ).asRefComponent()
));

Body(sheetStack)
    .addClass("fullscreen");

const validator = (page: number) => async () => {
    const { error, validate } = Validate(state, pages[ page ]);

    const data = validate();
    if (error.getValue()) return state.validationState = error.getValue();
    if (data) await API.music.id(dropId).update(data);
    state.page++;
    state.validationState = undefined;
};

const footer = (page: number) => Horizontal(
    page == 0 ? Button("Cancel").setJustify("center").setStyle(ButtonStyle.Secondary).onClick(() => location.href = "/music")
        : Button("Back").setJustify("center").setStyle(ButtonStyle.Secondary).onClick(() => state.page--),
    Spacer(),
    Box(state.$validationState.map(error => error ? CenterV(
        Label(getErrorMessage(error))
            .addClass("error-message")
            .setMargin("0 0.5rem 0 0")
    )
        : Empty()).asRefComponent()),
    Button("Next").setJustify("center").onClick(validator(page))).addClass("footer");

const wizard = state.$page.map(page => {
    if (page == 0) return Vertical(
        Spacer(),
        MediaQuery(
            "(max-width: 500px)",
            (small) =>
                Label("Lets make your Drop hit!")
                    .setWidth(small ? "max(1rem, 15rem)" : "max(1rem, 25rem)")
                    .setFontWeight("extrabold")
                    .setTextSize(small ? "3xl" : "6xl"),
        ).setAttribute("style", "display: flex"),
        Spacer(),
        Center(
            Vertical(
                Center(Label("Do you already have a UPC or EAN?").addClass("title")),
                TextInput("text", "UPC/EAN").sync(state, "upc")
                    .setWidth("436px")
                    .addClass("max-width"),
                Button("No, I don't have one.")
                    .setJustify("center")
                    .addClass("max-width")
                    .setStyle(ButtonStyle.Secondary)
                    .onClick(validator(page))
            ).setGap(),
        ),
        Spacer(),
        Spacer(),
        footer(page)
    ).addClass("wwizard");
    else if (page == 1) return Vertical(
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
                    .setGap(),
                Button("Artists")
                    .onClick(() => EditArtistsDialog(state).open()),
                Center(Label("Set your target Audience").addClass("title")),
                Grid(
                    DropDownInput("Primary Genre", Object.keys(genres))
                        .sync(state, "primaryGenre")
                        .onChange(() => state.secondaryGenre = undefined),
                    state.$primaryGenre.map(() =>
                        DropDownInput("Secondary Genre", getSecondary(genres, state.primaryGenre) ?? [])
                            .sync(state, "secondaryGenre")
                            .setColor(getSecondary(genres, state.primaryGenre) ? Color.Grayscaled : Color.Disabled)
                            .addClass("border-box")
                            .setWidth("100%")
                    ).asRefComponent(),
                )
                    .setGap()
                    .setEvenColumns(small ? 1 : 2),
            )
                .setEvenColumns(1)
                .addClass("grid-area")
                .setGap()
        ),
        Spacer(),
        footer(page)
    ).addClass("wwizard");
    else if (page == 2) return Vertical(
        Spacer(),
        Grid(
            Center(Label("Display the Copyright").addClass("title")),
            TextInput("text", "Composition Copyright").sync(state, "compositionCopyright"),
            TextInput("text", "Sound Recording Copyright").sync(state, "soundRecordingCopyright"),
        )
            .setEvenColumns(1)
            .addClass("grid-area")
            .setGap(),
        Spacer(),
        footer(page)
    ).addClass("wwizard");
    else if (page == 3) return Vertical(
        Spacer(),
        Center(
            state.$artworkClientData.map(data => Vertical(
                CenterAndRight(
                    Label("Upload your Cover").addClass("title"),
                    Button("Manual Upload")
                        .onClick(() => createFilePicker(allowedImageFormats.join(",")).then(file => uploadArtwork(dropId, file, state.$artworkClientData, state.$loading, state.$artwork)))
                ),
                DropAreaInput(
                    CenterV(data ? Image(data, "A Music Album Artwork.") : Label("Drop your Artwork here.").setTextSize("xl").setFontWeight("semibold")),
                    allowedImageFormats,
                    ([ { file } ]) => uploadArtwork(dropId, file, state.$artworkClientData, state.$loading, state.$artwork)
                ).addClass("drop-area")
            ).setGap()).asRefComponent()
        ),
        Spacer(),
        footer(page)
    ).addClass("wwizard");
    else if (page == 4) return Vertical(
        Spacer(),
        Horizontal(
            Spacer(),
            Vertical(
                CenterAndRight(
                    Label("Manage your Music").addClass("title"),
                    Button("Manual Upload")
                        .onClick(() => createFilePicker(allowedAudioFormats.join(",")).then(file => uploadSongToDrop(state, state.$uploadingSongs, file)))
                ),
                ManageSongs(state),
            ).setGap(),
            Spacer()
        ),
        Spacer(),
        footer(page)
    ).addClass("wwizard");
    else if (page == 5) return Vertical(
        Spacer(),
        Horizontal(
            Spacer(),
            Label("Thanks! That's everything we need.").setBalanced().addClass("ending-title"),
            Spacer(),
        ),
        Horizontal(
            Spacer(),
            TextInput("text", "Comments for Review Team").sync(state, "comments"),
            Spacer()
        ),
        Spacer(),
        Horizontal(Button("Back").setJustify("center").setStyle(ButtonStyle.Secondary).onClick(() => state.page--), Spacer(), Button("Submit").setJustify("center").onClick(async () => {
            state.loaded = false;
            await API.music.id(dropId).update(state);

            await API.music.id(dropId).type.post(DropType.UnderReview);
            location.href = "/music";
        })).addClass("footer"),
    ).addClass("wwizard");
    return LoadingSpinner();
}).asRefComponent();