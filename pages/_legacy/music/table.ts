import { Progress } from "shared/mod.ts";
import { Box, ButtonStyle, Checkbox, Color, Content, DropDownInput, IconButton, Image, InlineTextInput, Label, MIcon, State, StateHandler, Table } from "webgen/mod.ts";
import genres from "../../../data/genres.json" with { type: "json" };
import language from "../../../data/language.json" with { type: "json" };
import { Drop } from "../../../spec/music.ts";
import { EditArtists, ProfilePicture, getSecondary, getYearList } from "../helper.ts";

export function ManageSongs(state: StateHandler<{ songs: Drop[ "songs" ]; }>) {
    const tableView = Content(
        Table([
            [ "Title", "auto", ({ progress, title }, index) => progress !== undefined ? Progress(progress) : InlineTextInput("text", "blur").addClass("low-level").setValue(title).onChange(x => update(state, index, "title", x)) ],
            [ "Artists", "max-content", ({ artists }, index) =>
                Box(
                    ...artists.map(([ name, url, _type ]: string[]) =>
                        ProfilePicture(url ? Image(url, "A profile picture") : Label(""), name)
                    ),
                    IconButton(MIcon("add"), "add")
                )
                    .addClass("artists-list")
                    .onClick(() => {
                        EditArtists(artists ?? [ [ "", "", "PRIMARY" ] ]).then((x) => {
                            update(state, index, "artists", x?.map(x => x.map(x => x.trim())));
                        });
                    })
            ],
            [ "Year", "max-content", ({ year }, index) =>
                DropDownInput("Year", getYearList())
                    .setValue(year.toString())
                    .onChange((data) => update(state, index, "year", data ? parseInt(data) : undefined))
                    .setStyle(ButtonStyle.Inline)
                    .addClass("low-level")
            ],
            [ "Country", "max-content", (row, index) =>
                DropDownInput("Country", Object.keys(language))
                    .setRender((key) => language[ <keyof typeof language>key ])
                    .setValue(row.country)
                    .onChange((data) => update(state, index, "country", data))
                    .setStyle(ButtonStyle.Inline)
                    .addClass("low-level")
            ],
            //TODO: Lock these components (greyed out), if only one song, since dependent on drop level values
            [ "Primary Genre", "max-content", ({ primaryGenre }, index) =>
                DropDownInput("Primary Genre", Object.keys(genres))
                    .setValue(primaryGenre)
                    .onChange((data) => {
                        update(state, index, "primaryGenre", data);
                        update(state, index, "secondaryGenre", undefined);
                    })
                    .setStyle(ButtonStyle.Inline)
                    .addClass("low-level")
            ],
            [ "Secondary Genre", "max-content", ({ primaryGenre, secondaryGenre }, index) =>
                DropDownInput("Secondary Genre", getSecondary(genres, primaryGenre) ?? [])
                    .setValue(secondaryGenre ? secondaryGenre : undefined)
                    .onChange((data) => update(state, index, "secondaryGenre", data))
                    .setStyle(ButtonStyle.Inline)
                    .addClass("low-level")
            ],
            [ "Instrumental", "max-content", ({ instrumental, explicit }, index) =>
                Checkbox(instrumental ?? false)
                    .setColor(explicit ? Color.Disabled : Color.Grayscaled)
                    .onClick((_, value) => update(state, index, "instrumental", !value))
                    .addClass("low-level")
            ],
            [ "Explicit", "max-content", ({ explicit, instrumental }, index) =>
                Checkbox(explicit ?? false)
                    .setColor(instrumental ? Color.Disabled : Color.Grayscaled)
                    .onClick((_, value) => update(state, index, "explicit", !value))
                    .addClass("low-level")
            ]
        ], state.songs ?? []).setDelete((_, i) => {
            state.songs = state.songs?.filter((_, index) => index != i) as typeof state.songs;
        }).addClass("inverted-class", "light-mode")
    );
    // state.$on("songs", () => {
    //     tableView.viewOptions().update({});
    // });
    return tableView.addClass("inverted-class");
}

// deno-lint-ignore no-explicit-any
function update(state: StateHandler<{ songs: Drop[ "songs" ]; }>, index: number, key: keyof NonNullable<Drop[ "songs" ]>[ 0 ], value: any) {
    if (!state.songs)
        state.songs = State([]);
    // @ts-ignore errors due to any usage.
    state.songs[ index ][ key ] = value;
    // @ts-ignore errors due to any usage.
    state.songs = State([ ...state.songs ]);
}