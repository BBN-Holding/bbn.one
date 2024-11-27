import { sheetStack } from "shared/helper.ts";
import { API, stupidErrorAlert } from "shared/mod.ts";
import { asRef, asRefRecord, Box, DropDown, Grid, PrimaryButton, SheetHeader, Table, TextInput, WriteSignal } from "webgen/mod.ts";
import { Artist, ArtistRef, ArtistTypes, Song } from "../../../spec/music.ts";
import "./table.css";

export function ManageSongs(songs: WriteSignal<Song[]>, uploadingSongs: WriteSignal<{ [uploadId: string]: number }[]>, primaryGenre: string, artistList?: Artist[]) {
    return Table(songs);
    // return new Table2(songs)
    //     .setColumnTemplate("auto max-content max-content max-content max-content max-content max-content min-content")
    //     .addColumn("Title", (song) =>
    //         uploadingSongs.map((x) => {
    //             if (x.filter((y) => y[song._id] !== undefined).length > 0) {
    //                 return Progress(x.find((y) => y[song._id] !== undefined)[song._id]);
    //             }
    //             const title = asRef(song.title);
    //             title.listen((newVal, oldVal) => (oldVal != undefined) && songs.updateItem(song, { ...song, title: newVal }));
    //             return InlineTextInput("text", "blur").addClass("low-level").ref(title);
    //         }).asRefComponent())
    //     .addColumn("Artists", (song) =>
    //         Box(...song.artists.map((artist) => "name" in artist ? ProfilePicture(Label(""), artist.name) : ProfilePicture(Label(""), artist._id)), IconButton(MIcon("add"), "add"))
    //             .addClass("artists-list")
    //             .onClick(() => {
    //                 const artists = asRef(song.artists);
    //                 artists.listen((newVal, oldVal) => (oldVal != undefined) && songs.updateItem(song, { ...song, artists: newVal }));
    //                 EditArtistsDialog(artists, artistList).open();
    //             }))
    //     .addColumn("Year", (song) => {
    //         const data = asRef(song.year.toString());
    //         data.listen((x, oldVal) => (oldVal != undefined) && songs.updateItem(song, { ...song, year: parseInt(x) }));
    //         return DropDownInput("Year", getYearList())
    //             .ref(data)
    //             .addClass("low-level");
    //     })
    //     .addColumn("Language", (song) => {
    //         const data = asRef(song.language);
    //         data.listen((x, oldVal) => (oldVal != undefined) && songs.updateItem(song, { ...song, language: x }));
    //         return DropDownInput("Language", Object.keys(language))
    //             .setRender((key) => language[<keyof typeof language> key])
    //             .ref(data)
    //             .addClass("low-level");
    //     })
    //     .addColumn("Secondary Genre", (song) => {
    //         const data = asRef(song.secondaryGenre);
    //         data.listen((x, oldVal) => (oldVal != undefined) && songs.updateItem(song, { ...song, secondaryGenre: x }));
    //         return DropDownInput("Secondary Genre", getSecondary(genres, primaryGenre) ?? [])
    //             .ref(data)
    //             .addClass("low-level");
    //     })
    //     .addColumn("Instrumental", (song) =>
    //         Checkbox(song.instrumental ?? false)
    //             .setColor(song.explicit ? Color.Disabled : Color.Grayscaled)
    //             .onClick((_, value) => songs.updateItem(song, { ...song, instrumental: value }))
    //             .addClass("low-level"))
    //     .addColumn("Explicit", (song) =>
    //         Checkbox(song.explicit ?? false)
    //             .setColor(song.instrumental ? Color.Disabled : Color.Grayscaled)
    //             .onClick((_, value) => songs.updateItem(song, { ...song, explicit: value }))
    //             .addClass("low-level"))
    //     .addColumn("", (song) => IconButton(MIcon("delete"), "Delete").onClick(() => songs.setValue(songs.getValue().filter((x) => x._id != song._id))))
    //     .addClass("inverted-class");
}

export const createArtistSheet = (name?: string) => {
    const state = asRefRecord({
        name,
        spotify: <string | undefined> undefined,
        apple: <string | undefined> undefined,
    });
    return Grid(
        SheetHeader("Create Artist", sheetStack),
        TextInput(state.name, "Artist Name"),
        TextInput(state.spotify, "Spotify URL"),
        TextInput(state.apple, "Apple Music URL"),
        PrimaryButton("Create")
            .onPromiseClick(async () => {
                await API.music.artists.create(Object.fromEntries(Object.entries(state).map(([key, state]) => [key, state.value])) as any).then(stupidErrorAlert);
                sheetStack.removeOne();
                location.reload();
            })
            .setDisabled(state.name.map((x) => !x))
            .setJustifySelf("start"),
    )
        .setGap()
        .setWidth("25rem");
};

export const EditArtistsDialog = (artists: WriteSignal<ArtistRef[]>, provided?: Artist[]) => {
    const artistList = provided ? asRef(provided) : asRef(<Artist[]> []);

    if (!provided) {
        API.music.artists.list().then(stupidErrorAlert)
            .then((x) => artistList.setValue(x));
    }

    return Grid(
        SheetHeader("Edit Artists", sheetStack),
        Box(artistList.map((list) =>
            Table(
                artists,
                asRef({
                    type: {
                        cellRenderer: (x) => {
                            // const data = asRef(x);
                            // data.listen((type, oldVal) => {
                            //     if (oldVal != undefined) {
                            //         if (type == ArtistTypes.Primary || type == ArtistTypes.Featuring) {
                            //             artists.updateItem(x, { type, _id: null! } as ArtistRef);
                            //         } else {
                            //             artists.updateItem(x, { type, name: "" } as ArtistRef);
                            //         }
                            //     }
                            // });
                            return DropDown(Object.values(ArtistTypes), asRef(ArtistTypes.Primary));
                        },
                    },
                }),
            )
        )),
        PrimaryButton("Add Artist")
            .setJustifySelf("end")
            .onClick(() => artists.addItem({ type: ArtistTypes.Primary, _id: null! } as ArtistRef)),
        PrimaryButton("Save")
            .onClick(() => sheetStack.removeOne()),
    ).setGap();
};
