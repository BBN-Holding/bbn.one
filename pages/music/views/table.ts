import { API, Progress, stupidErrorAlert, Table2 } from "shared/mod.ts";
import { asRef, asState, Box, Button, ButtonStyle, Checkbox, Color, DropDownInput, Grid, Horizontal, IconButton, InlineTextInput, Label, MIcon, Reference, SheetDialog, Spacer, TextInput, Vertical } from "webgen/mod.ts";
import genres from "../../../data/genres.json" with { type: "json" };
import language from "../../../data/language.json" with { type: "json" };
import { Artist, ArtistRef, ArtistTypes, Song } from "../../../spec/music.ts";
import { getSecondary, getYearList, ProfilePicture, sheetStack } from "../../_legacy/helper.ts";
import "./table.css";

export function ManageSongs(songs: Reference<Song[]>, uploadingSongs: Reference<{ [uploadId: string]: number }[]>, primaryGenre: string) {
    return new Table2(songs)
        .setColumnTemplate("auto max-content max-content max-content max-content max-content max-content min-content")
        .addColumn("Title", (song) => uploadingSongs.map((x) => x.filter((y) => y[song._id] !== undefined).length > 0 ? Progress(x.find((y) => y[song._id] !== undefined)[song._id]) : InlineTextInput("text", "blur").addClass("low-level").sync(song, "title")).asRefComponent())
        .addColumn("Artists", (song) =>
            Box(...song.artists.map((artist) => ProfilePicture(Label(""), "artist.name ?? artist._id")), IconButton(MIcon("add"), "add"))
                .addClass("artists-list")
                .onClick(() => {
                    const artists = asRef(song.artists);
                    artists.listen((x) => songs.updateItem(song, { ...song, artists: x }));
                    EditArtistsDialog(artists).open();
                }))
        .addColumn("Year", (song) => {
            const data = asRef(song.year.toString());
            data.listen((x) => songs.updateItem(song, { ...song, year: parseInt(x) }));
            return DropDownInput("Year", getYearList())
                .ref(data)
                .setStyle(ButtonStyle.Inline)
                .addClass("low-level");
        })
        //TODO: create real country.json
        .addColumn("Country", (song) => {
            const data = asRef(song.country);
            data.listen((x) => songs.updateItem(song, { ...song, country: x }));
            return DropDownInput("Country", Object.keys(language))
                .ref(data)
                .setRender((key) => language[<keyof typeof language> key])
                .setStyle(ButtonStyle.Inline)
                .addClass("low-level");
        })
        .addColumn("Secondary Genre", (song) => {
            const data = asRef(song.secondaryGenre);
            data.listen((x) => songs.updateItem(song, { ...song, secondaryGenre: x }));
            return DropDownInput("Secondary Genre", getSecondary(genres, primaryGenre) ?? [])
                .ref(data)
                .setStyle(ButtonStyle.Inline)
                .addClass("low-level");
        })
        .addColumn("Instrumental", (song) =>
            Checkbox(song.instrumental ?? false)
                .setColor(song.explicit ? Color.Disabled : Color.Grayscaled)
                .onClick((_, value) => songs.updateItem(song, { ...song, instrumental: !value }))
                .addClass("low-level"))
        .addColumn("Explicit", (song) =>
            Checkbox(song.explicit ?? false)
                .setColor(song.instrumental ? Color.Disabled : Color.Grayscaled)
                .onClick((_, value) => songs.updateItem(song, { ...song, explicit: !value }))
                .addClass("low-level"))
        .addColumn("", (song) => IconButton(MIcon("delete"), "Delete").onClick(() => songs.setValue(songs.getValue().filter((x) => x._id != song._id))))
        .addClass("inverted-class");
}

const createArtistSheet = (name?: string) => {
    const state = asState({
        name,
        spotify: <string | undefined> undefined,
        apple: <string | undefined> undefined,
    });
    const { promise, resolve } = Promise.withResolvers<void>();
    const dialog = SheetDialog(
        sheetStack,
        "Create Artist",
        Grid(
            TextInput("text", "Artist Name").ref(state.$name),
            TextInput("text", "Spotify URL").ref(state.$spotify),
            TextInput("text", "Apple Music URL").ref(state.$apple),
            Button("Create")
                .setJustifySelf("start")
                .onPromiseClick(async () => {
                    await API.music.artists.create(state);
                    dialog.close();
                    resolve();
                }),
        )
            .setAlignContent("start")
            .setWidth("400px")
            .setHeight("420px")
            .setGap(),
    );
    dialog.open();
    return promise;
};

const ARTIST_ARRAY = Object.values(ArtistTypes);
export const EditArtistsDialog = (artists: Reference<ArtistRef[]>) => {
    const artistList = asRef(<Artist[]> []);

    API.music.artists.list().then(stupidErrorAlert)
        .then((x) => {
            artistList.setValue(x);
        });

    const dialog = SheetDialog(
        sheetStack,
        "Manage your Artists",
        Vertical(
            artistList.map((list) =>
                new Table2(artists)
                    .addClass("artist-table")
                    .setColumnTemplate("10rem 10rem min-content")
                    .addColumn("Type", (artist) => {
                        const data = asRef(artist.type);
                        data.listen((type, oldVal) => {
                            if (oldVal != undefined) {
                                console.log(type);
                                if (type == ArtistTypes.Primary || type == ArtistTypes.Featuring) {
                                    artists.updateItem(artist, { type, _id: "123" } as ArtistRef);
                                } else {
                                    artists.updateItem(artist, { type, name: "" } as ArtistRef);
                                }
                            }
                        });
                        return DropDownInput("Type", ARTIST_ARRAY)
                            .ref(data);
                    })
                    .addColumn("Name", (artist) => {
                        if ([ArtistTypes.Primary, ArtistTypes.Featuring].includes(artist.type)) {
                            const data = asRef(artist._id as string);
                            data.listen((_id, oldVal) => {
                                if (oldVal != undefined) {
                                    artists.updateItem(artist, { ...artist, _id } as ArtistRef);
                                }
                            });
                            return DropDownInput("Select Artist", list.map((y) => y._id))
                                .ref(data)
                                .setRender((data) => {
                                    const artist = list.find((y) => y._id === data);
                                    return artist ? artist.name : "sdf";
                                })
                                .addAction(MIcon("add"), "Create Artist", () => {
                                    createArtistSheet().then(() => {
                                        API.music.artists.list().then(stupidErrorAlert)
                                            .then((x) => {
                                                artistList.setValue(x);
                                            });
                                    });
                                });
                        } else {
                            const data = asRef(artist.name as string);
                            data.listen((name, oldVal) => {
                                if (oldVal != undefined) {
                                    artists.updateItem(artist, { ...artist, name } as ArtistRef);
                                }
                            });
                            return TextInput("text", "Name", "blur")
                                .ref(data);
                        }
                    })
                    .addColumn("", (data) => IconButton(MIcon("delete"), "Delete").onClick(() => artists.setValue(artists.getValue().filter((_, i) => i != artists.getValue().indexOf(data)))))
            ).asRefComponent(),
            Horizontal(
                Spacer(),
                Button("Add Artist")
                    .onClick(() => artists.setValue([...artists.getValue(), { type: ArtistTypes.Primary, _id: "" }] as ArtistRef[])),
            ).setPadding("0 0 3rem 0"),
            Horizontal(
                Spacer(),
                Button("Save")
                    .onClick(() => dialog.close()),
            ),
        ),
    );

    return dialog;
};
