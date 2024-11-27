import { allowedAudioFormats, allowedImageFormats, getSecondary, RegisterAuthRefresh, sheetStack } from "shared/helper.ts";
import { API, stupidErrorAlert } from "shared/mod.ts";
import { appendBody, asRef, asRefRecord, Box, Color, Content, createFilePicker, DateInput, DialogContainer, DropDown, Empty, FullWidthSection, Grid, Image, Label, PrimaryButton, SecondaryButton, SheetHeader, Spinner, TextAreaInput, TextInput, WebGenTheme } from "webgen/mod.ts";
import { ZodError } from "zod/mod.ts";
import "../../assets/css/main.css";
import { templateArtwork } from "../../assets/imports.ts";
import { DynaNavigation } from "../../components/nav.ts";
import genres from "../../data/genres.json" with { type: "json" };
import language from "../../data/language.json" with { type: "json" };
import { ArtistRef, ArtistTypes, DropType, Song } from "../../spec/music.ts";
import { uploadArtwork, uploadSongToDrop } from "./data.ts";
import "./newDrop.css";
import { EditArtistsDialog, ManageSongs } from "./views/table.ts";

await RegisterAuthRefresh();

const params = new URLSearchParams(location.search);

if (!params.has("id")) {
    alert("ID is missing");
    location.href = "/c/music";
}
const dropId = params.get("id")!;

export const creationState = asRefRecord({
    _id: <string> dropId,
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
    artworkClientData: <Blob | undefined> undefined,
    uploadingSongs: <Record<string, number>[]> [],
    songs: <Song[]> [],
    comments: <string | undefined> undefined,
    page: 0,
    validationState: <ZodError | undefined> undefined,
});

API.music.id(dropId).get().then(stupidErrorAlert)
    .then(async (drop) => {
        creationState.gtin.setValue(drop.gtin);
        creationState.title.setValue(drop.title);
        creationState.release.setValue(drop.release);
        creationState.language.setValue(drop.language);
        creationState.artists.setValue(drop.artists ?? [{ type: ArtistTypes.Primary, _id: null! }]);
        creationState.primaryGenre.setValue(drop.primaryGenre);
        creationState.secondaryGenre.setValue(drop.secondaryGenre);
        creationState.compositionCopyright.setValue(drop.compositionCopyright ?? "BBN Music (via bbn.one)");
        creationState.soundRecordingCopyright.setValue(drop.soundRecordingCopyright ?? "BBN Music (via bbn.one)");
        creationState.artwork.setValue(drop.artwork);
        creationState.artworkClientData.setValue(<Blob | undefined> (drop.artwork ? await API.music.id(dropId).artwork().then(stupidErrorAlert) : undefined));
        creationState.songs.setValue(drop.songs ?? []);
        creationState.comments.setValue(drop.comments);
    })
    .then(() => creationState.page.setValue(1));

const additionalDropInformation = Grid(
    SheetHeader("Additional Information", sheetStack),
    TextInput(creationState.gtin, "UPC/EAN"),
    TextInput(creationState.compositionCopyright, "Composition Copyright"),
    TextInput(creationState.soundRecordingCopyright, "Sound Recording Copyright"),
    PrimaryButton("Save").onClick(() => sheetStack.removeOne()),
).setGap();

const validator = (page: number) => async () => {
    // const { error, validate } = Validate(creationState, pages[page]);

    // const data = validate();
    // if (error.getValue()) return creationState.validationState = error.getValue();
    // if (data) await API.music.id(dropId).update(data);
    creationState.page.setValue(page + 1);
    creationState.validationState.setValue(undefined);
};

const footer = (page: number) =>
    Grid(
        page == 0 ? SecondaryButton("Cancel").setJustifyContent("center").onClick(() => location.href = "/c/music") : SecondaryButton("Back").setJustifyContent("center").onClick(() => creationState.page.setValue(page - 1)),
        Box(
            creationState.validationState.map((error) =>
                error
                    ? CenterV(
                        Label(getErrorMessage(error))
                            .setMargin("0 0.5rem 0 0"),
                    )
                    : Empty()
            ),
        ),
        PrimaryButton("Next").setJustifyContent("center").onClick(validator(page)),
    )
        .setGap()
        .setTemplateColumns("1fr auto 1fr");

const wizard = creationState.page.map((page) => {
    if (page == 0) {
        return Spinner();
    } else if (page == 1) {
        return Grid(
            Grid(
                Label("Enter your Album details.").setFontWeight("bold").setTextSize("xl").setJustifySelf("center"),
                TextInput(creationState.title, "Title"),
                Grid(
                    DateInput(creationState.release, "Release Date"),
                    DropDown(Object.keys(language), creationState.language, "Language")
                        .setValueRender((key) => language[<keyof typeof language> key]),
                )
                    .setEvenColumns(2)
                    // .setEvenColumns(small ? 1 : 2)
                    .setGap(),
                PrimaryButton("Artists")
                    .onClick(() => sheetStack.addSheet(EditArtistsDialog(creationState.artists))),
                Label("Set your target Audience").setFontWeight("bold").setTextSize("xl").setJustifySelf("center"),
                Grid(
                    DropDown(Object.keys(genres), creationState.primaryGenre, "Primary Genre"),
                    // .onChange(() => creationState.secondaryGenre.setValue(undefined)), //move to listen
                    Box(creationState.primaryGenre.map((primaryGenre) => DropDown(getSecondary(genres, primaryGenre) ?? [], creationState.secondaryGenre, "Secondary Genre") // .setColor(getSecondary(genres, primaryGenre) ? Color.Grayscaled : Color.Disabled)
                    )),
                )
                    .setGap()
                    .setEvenColumns(2),
                PrimaryButton("Additional Information")
                    .onClick(() => sheetStack.addSheet(additionalDropInformation)),
            )
                .setGap()
                .setEvenColumns(1),
            footer(page),
        ).setGap();
    } else if (page == 2) {
        return Grid(
            creationState.artworkClientData.map((data) =>
                Grid(
                    Grid(
                        Label("Upload your Cover").setFontWeight("bold").setTextSize("xl").setJustifySelf("center"),
                        PrimaryButton("Manual Upload")
                            .onClick(() => createFilePicker(allowedImageFormats.join(",")).then((file) => uploadArtwork(dropId, file, creationState.artworkClientData, creationState.artwork))),
                    ).setTemplateColumns("1fr auto"),
                    Image(data ? URL.createObjectURL(data) : templateArtwork, "A Music Album Artwork.").setMaxHeight("60%").setCssStyle("aspectRatio", "1 / 1"),
                ).setGap()
            ),
            footer(page),
        ).setGap();
    } else if (page == 3) {
        creationState.songs.listen((songs, oldVal) => {
            if (oldVal != undefined) {
                creationState.songs.setValue(songs);
            }
        });
        const songs = asRef(<undefined | Song[]> undefined);
        // const existingSongDialog = ExistingSongDialog(creationState.songs, songs);
        return Grid(
            Grid(
                Grid(
                    Label("Manage your Music"),
                    Box(
                        PrimaryButton("Manual Upload")
                            .onClick(() => createFilePicker(allowedAudioFormats.join(",")).then((file) => uploadSongToDrop(creationState.songs, creationState.artists, creationState.language, creationState.primaryGenre, creationState.secondaryGenre, creationState.uploadingSongs, file))).setMargin("0 1rem 0 0"),
                        PrimaryButton("Add an existing Song")
                            .onPromiseClick(async () => {
                                songs.setValue((await API.music.songs.list().then(stupidErrorAlert)).filter((song) => creationState.songs.value.some((dropsong) => dropsong._id !== song._id)));
                                // existingSongDialog.open();
                            }),
                    ),
                    ManageSongs(creationState.songs, creationState.uploadingSongs, creationState.primaryGenre!),
                ).setGap(),
            ),
            footer(page),
        );
    } else if (page == 4) {
        return Grid(
            Grid(
                Label("Thanks! That's everything we need."),
            ),
            Grid(
                TextAreaInput(creationState.comments, "Comments for Review Team"),
            ),
            Grid(
                SecondaryButton("Back").setJustifyContent("center").onClick(() => creationState.page.setValue(3)),
                PrimaryButton("Submit").onPromiseClick(async () => {
                    creationState.page.setValue(0);
                    await API.music.id(dropId).update(creationState);

                    await API.music.id(dropId).type.post(DropType.UnderReview);
                    location.href = "/c/music";
                }).setJustifyContent("center"),
            ).setGap()
                .setTemplateColumns("1fr 1fr"),
        ).setGap();
    }
    return Empty();
});

appendBody(
    WebGenTheme(
        DialogContainer(sheetStack.visible(), sheetStack),
        Content(
            FullWidthSection(
                DynaNavigation("Music"),
            ),
            Box(wizard),
        )
            .setContentMaxWidth("50%"),
    ).setPrimaryColor(new Color("white")),
);
