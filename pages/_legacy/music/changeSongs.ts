import * as zod from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { API } from "shared/mod.ts";
import { Box, Button, CenterV, Empty, Grid, Horizontal, Label, Spacer, StateHandler, Validate, asState, createFilePicker, getErrorMessage } from "webgen/mod.ts";
import { Artist, DATE_PATTERN, Song, artist, song, userString } from "../../../spec/music.ts";
import { allowedAudioFormats } from "../helper.ts";
import { uploadSongToDrop } from "./data.ts";
import { ManageSongs } from "./table.ts";

export function ChangeSongs(drop: StateHandler<{ _id: string, songs: Song[], title: string | undefined, release: string | undefined, language: string | undefined, artists: Artist[], primaryGenre: string | undefined, secondaryGenre: string | undefined, }>) {
    const state = asState({
        uploadingSongs: <string[]>[],
        validationState: <zod.ZodError | undefined>undefined
    });

    const { data, error, validate } = Validate(
        drop,
        zod.object({
            title: userString,
            artists: artist.array().refine(x => x.some(([ , , type ]) => type == "PRIMARY"), { message: "At least one primary artist is required" }),
            release: zod.string().regex(DATE_PATTERN, { message: "Not a date" }),
            language: zod.string(),
            primaryGenre: zod.string(),
            secondaryGenre: zod.string(),
            compositionCopyright: userString,
            soundRecordingCopyright: userString,
            artwork: zod.string(),
            songs: song.array().min(1, { message: "At least one song is required" }),
        })
    );

    return Grid(
        [
            { width: 2 },
            Horizontal(
                Box(state.$validationState.map(error => error ? CenterV(
                    Label(getErrorMessage(error))
                        .addClass("error-message")
                        .setMargin("0 0.5rem 0 0")
                )
                    : Empty()).asRefComponent()),
                Spacer(),
                Button("Save")
                    .onClick(async () => {
                        const validation = validate();
                        if (error.getValue()) return state.validationState = error.getValue();
                        if (validation) await API.music.id(data._id!).update(validation);
                        location.reload(); // Handle this Smarter => Make it a Reload Event.
                    })
            ),
        ],
        [
            { width: 2 },
            ManageSongs(data),
        ],
        [
            { width: 2 },
            Horizontal(
                Spacer(),
                Button("Add a new Song")
                    .onClick(() => createFilePicker(allowedAudioFormats.join(",")).then(file => uploadSongToDrop(data, state.$uploadingSongs, file)))
            )
        ],
    )
        .setGap("15px")
        .setPadding("15px 0 0 0");
}