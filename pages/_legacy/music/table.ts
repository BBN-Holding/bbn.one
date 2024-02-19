import { Progress, Table2 } from "shared/mod.ts";
import { Box, ButtonStyle, Checkbox, Color, DropDownInput, IconButton, Image, InlineTextInput, Label, MIcon, StateHandler } from "webgen/mod.ts";
import genres from "../../../data/genres.json" with { type: "json" };
import language from "../../../data/language.json" with { type: "json" };
import { Artist, Song } from "../../../spec/music.ts";
import { EditArtistsDialog, ProfilePicture, getSecondary, getYearList } from "../helper.ts";
import "./table.css";

export function ManageSongs(state: StateHandler<{ songs: Song[]; primaryGenre: string | undefined; }>) {
    return new Table2(state.$songs)
        .setColumnTemplate("auto max-content max-content max-content max-content max-content max-content min-content")
        .addColumn("Title", (song) => song.progress !== undefined ? Progress(song.progress) :
            InlineTextInput("text", "blur").addClass("low-level").sync(song, "title"))
        .addColumn("Artists", (song) =>
            song.$artists.map(artists => Box(...artists.map(([ name, url, _type ]: Artist) =>
                ProfilePicture(url ? Image(url, "A profile picture") : Label(""), name)
            ), IconButton(MIcon("add"), "add"))
                .addClass("artists-list")
                .onClick(() => EditArtistsDialog(song).open())
            ).asRefComponent())
        .addColumn("Year", (song) => DropDownInput("Year", getYearList())
            .setValue(song.year.toString())
            .onChange(data => song.year = parseInt(data))
            .setStyle(ButtonStyle.Inline)
            .addClass("low-level"))
        //TODO: create real country.json as soon as searchable dropdown is implemented
        .addColumn("Country", (song) => DropDownInput("Country", Object.keys(language))
            .setRender(key => language[ <keyof typeof language>key ])
            .sync(song, "country")
            .setStyle(ButtonStyle.Inline)
            .addClass("low-level"))
        .addColumn("Secondary Genre", (song) => DropDownInput("Secondary Genre", getSecondary(genres, state.primaryGenre) ?? [])
            .sync(song, "secondaryGenre")
            .setStyle(ButtonStyle.Inline)
            .addClass("low-level"))
        .addColumn("Instrumental", (song) => Checkbox(song.instrumental ?? false)
            .setColor(song.explicit ? Color.Disabled : Color.Grayscaled)
            .onClick((_, value) => song.instrumental = !value)
            .addClass("low-level"))
        .addColumn("Explicit", (song) => Checkbox(song.explicit ?? false)
            .setColor(song.instrumental ? Color.Disabled : Color.Grayscaled)
            .onClick((_, value) => song.explicit = !value)
            .addClass("low-level"))
        .addColumn("", (song) => IconButton(MIcon("delete"), "Delete").onClick(() => state.songs = state.songs.filter((x) => x.id != song.id) as typeof state.songs))
        .addClass("inverted-class");
}