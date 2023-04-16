import { Box, ButtonStyle, Checkbox, Component, createElement, Custom, DropDownInput, IconButton, Image, InlineTextInput, PlainText, State, StateHandler, Table, View } from "webgen/mod.ts";
import { EditArtists, getSecondary, getYearList, stringToColour } from "../helper.ts";
import primary from "../../../data/primary.json" assert { type: "json"};
import secondary from "../../../data/secondary.json" assert { type: "json"};
import language from "../../../data/language.json" assert { type: "json"};
import { Drop } from "../../../spec/music.ts";

function Progress(progress: number) {
    return Box(
        Custom((() => {
            if (progress == -1) return PlainText("⚠️ Failed to upload!").addClass("error-message").setFont(0.8).draw();
            const element = createElement("progress");
            element.max = 110;
            element.value = progress;
            return element;
        })()).addClass("low-level"));
}

function ProfilePicture(component: Component, name: string) {
    const ele = component.draw();
    ele.style.backgroundColor = stringToColour(name);
    return Custom(ele).addClass("profile-picture");
}

export function ManageSongs(state: StateHandler<{ songs: Drop[ "songs" ]; }>) {
    const tableView = View(() =>
        Table([
            [ "Title", "auto", ({ progress, title }, index) => progress ? Progress(progress) : InlineTextInput("text", "blur").addClass("low-level").setValue(title).onChange(x => update(state, index, "title", x)) ],
            [ "Artists", "max-content", ({ artists }, index) =>
                Box(
                    ...(artists ?? []).map(([ name, url, _type ]: string[]) =>
                        ProfilePicture(url ? Image(url, "A profile picture") : PlainText(""), name)
                    ),
                    IconButton("add", "add")
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
                    .setValue(year)
                    .onChange((data) => update(state, index, "year", data ? parseInt(data) : undefined))
                    .setStyle(ButtonStyle.Inline)
                    .addClass("low-level")
            ],
            [ "Country", "max-content", (row, index) =>
                DropDownInput("Country", Object.keys(language))
                    .setValue(row.country)
                    .onChange((data) => update(state, index, "country", data))
                    .setStyle(ButtonStyle.Inline)
                    .addClass("low-level")
            ],
            [ "Primary Genre", "max-content", ({ primaryGenre }, index) =>
                DropDownInput("Primary Genre", primary)
                    .setValue(primaryGenre)
                    .onChange((data) => {
                        update(state, index, "primaryGenre", data);
                        update(state, index, "secondaryGenre", undefined);
                    })
                    .setStyle(ButtonStyle.Inline)
                    .addClass("low-level")
            ],
            [ "Secondary Genre", "max-content", ({ primaryGenre, secondaryGenre }, index) =>
                DropDownInput("Secondary Genre", getSecondary(secondary, primaryGenre) ?? [])
                    .setValue(secondaryGenre ? secondaryGenre : undefined)
                    .onChange((data) => update(state, index, "secondaryGenre", data))
                    .setStyle(ButtonStyle.Inline)
                    .addClass("low-level")
            ],
            [ "Explicit", "max-content", ({ explicit }, index) =>
                Checkbox(explicit ?? false)
                    .onClick((_, value) => update(state, index, "explicit", !value))
                    .addClass("low-level")
            ]
        ], state.songs ?? []).setDelete((_, i) => {
            state.songs = state.songs?.filter((_, index) => index != i) as typeof state.songs;
        }).addClass("inverted-class", "light-mode")
    );
    state.$on("songs", () => {
        tableView.viewOptions().update({});
    });
    return tableView.asComponent().addClass("inverted-class");
}

// deno-lint-ignore no-explicit-any
function update(state: StateHandler<{ songs: Drop[ "songs" ]; }>, index: number, key: keyof NonNullable<Drop[ "songs" ]>[ 0 ], value: any) {
    if (!state.songs)
        state.songs = State([]);
    // @ts-ignore errors due to any usage.
    state.songs[ index ][ key ] = value;
    state.songs = State([ ...state.songs ]);
}