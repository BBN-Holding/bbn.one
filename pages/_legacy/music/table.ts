import { Progress, Table2 } from "shared/mod.ts";
import { asRef, Box, ButtonStyle, Checkbox, Color, DropDownInput, IconButton, InlineTextInput, Label, MIcon, Reference } from "webgen/mod.ts";
import genres from "../../../data/genres.json" with { type: "json" };
import language from "../../../data/language.json" with { type: "json" };
import { Song } from "../../../spec/music.ts";
import { EditArtistsDialog, getSecondary, getYearList, ProfilePicture } from "../helper.ts";
import "./table.css";

export function ManageSongs(songs: Reference<Song[]>, primaryGenre: string) {
    return new Table2(songs)
        .setColumnTemplate("auto max-content max-content max-content max-content max-content max-content min-content")
        .addColumn("Title", (song) => song.progress !== undefined ? Progress(song.progress) : InlineTextInput("text", "blur").addClass("low-level").sync(song, "title"))
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
        .addColumn("", (song) => IconButton(MIcon("delete"), "Delete").onClick(() => state.songs = state.songs.filter((x) => x.id != song.id) as typeof state.songs))
        .addClass("inverted-class");
}
