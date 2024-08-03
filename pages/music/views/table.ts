import { API, Progress, stupidErrorAlert, Table2 } from "shared/mod.ts";
import { asRef, asState, Box, Button, Checkbox, Color, DropDownInput, Grid, Horizontal, IconButton, InlineTextInput, Label, MIcon, Reference, SheetDialog, Spacer, TextInput } from "webgen/mod.ts";
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
            Box(...song.artists.map((artist) => "name" in artist ? ProfilePicture(Label(""), artist.name) : ProfilePicture(Label(""), artist._id)), IconButton(MIcon("add"), "add"))
                .addClass("artists-list")
                .onClick(() => {
                    const artists = asRef(song.artists);
                    artists.listen((newVal, oldVal) => {
                        if (oldVal != undefined) {
                            songs.setValue(songs.getValue().map((x) => x._id == song._id ? { ...song, artists: newVal } : x));
                        }
                    });
                    EditArtistsDialog(artists).open();
                }))
        .addColumn("Year", (song) => {
            const data = asRef(song.year.toString());
            data.listen((x) => songs.updateItem(song, { ...song, year: parseInt(x) }));
            return DropDownInput("Year", getYearList())
                .ref(data)
                .addClass("low-level");
        })
        //TODO: create real country.json
        .addColumn("Country", (song) => {
            const data = asRef(song.country);
            data.listen((x) => songs.updateItem(song, { ...song, country: x }));
            return DropDownInput("Country", Object.keys(language))
                .setRender((key) => language[<keyof typeof language> key])
                .ref(data)
                .addClass("low-level");
        })
        .addColumn("Secondary Genre", (song) => {
            const data = asRef(song.secondaryGenre);
            data.listen((x) => songs.updateItem(song, { ...song, secondaryGenre: x }));
            return DropDownInput("Secondary Genre", getSecondary(genres, primaryGenre) ?? [])
                .ref(data)
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

export const createArtistSheet = (name?: string) => {
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
            TextInput("text", "Artist Name").required().ref(state.$name),
            TextInput("text", "Spotify URL").ref(state.$spotify),
            TextInput("text", "Apple Music URL").ref(state.$apple),
            Button("Create")
                //still disabled if name exists
                .setColor(state.$name.map((x) => x ? Color.Grayscaled : Color.Disabled))
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

export const EditArtistsDialog = (artists: Reference<ArtistRef[]>) => {
    const artistList = asRef(<Artist[]> []);

    API.music.artists.list().then(stupidErrorAlert)
        .then((x) => artistList.setValue(x));

    const dialog = SheetDialog(
        sheetStack,
        "Manage your Artists",
        artistList.map((list) =>
            new Table2(artists)
                .addClass("artist-table")
                .setColumnTemplate("10rem 12rem min-content")
                .addColumn("Type", (artist) => {
                    const data = asRef(artist.type);
                    data.listen((type, oldVal) => {
                        if (oldVal != undefined) {
                            if (type == ArtistTypes.Primary || type == ArtistTypes.Featuring) {
                                artists.setValue(artists.getValue().map((x) => x == artist ? { type, _id: undefined! } : x));
                            } else {
                                artists.setValue(artists.getValue().map((x) => x == artist ? { type, name: "" } : x));
                            }
                        }
                    });
                    return DropDownInput("Type", Object.values(ArtistTypes))
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
                            .setRender((data) => {
                                const artist = list.find((y) => y._id === data);
                                return artist ? artist.name : "sdf";
                            })
                            .ref(data)
                            .addAction(MIcon("add"), "Create Artist", () => {
                                createArtistSheet().then(() => {
                                    API.music.artists.list().then(stupidErrorAlert)
                                        .then((x) => {
                                            artistList.setValue(x);
                                        });
                                });
                            });
                    }
                    const data = asRef(artist.name as string);
                    data.listen((name, oldVal) => {
                        if (oldVal != undefined) {
                            artists.updateItem(artist, { ...artist, name } as ArtistRef);
                        }
                    });
                    return TextInput("text", "Name", "blur")
                        .ref(data);
                })
                .addColumn("", (data) => IconButton(MIcon("delete"), "Delete").onClick(() => artists.setValue(artists.getValue().filter((_, i) => i != artists.getValue().indexOf(data)))))
        ).asRefComponent(),
        Horizontal(
            Spacer(),
            Button("Add Artist")
                .onClick(() => artists.addItem({ type: ArtistTypes.Primary, _id: undefined! } as ArtistRef)),
        ).setPadding("0 0 3rem 0"),
        Horizontal(
            Spacer(),
            Button("Save")
                .onClick(() => dialog.close()),
        ),
    );

    return dialog;
};
