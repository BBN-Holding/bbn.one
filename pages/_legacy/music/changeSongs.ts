import * as zod from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { API } from "shared/mod.ts";
import { Button, Grid, Horizontal, Spacer, State, Validate, createFilePicker } from "webgen/mod.ts";
import { Drop } from "../../../spec/music.ts";
import { allowedAudioFormats } from "../helper.ts";
import { uploadSongToDrop } from "./data.ts";
import { ManageSongs } from "./table.ts";

export function ChangeSongs(drop: Drop) {
    const { data, error, validate } = Validate(
        State({
            drop
        }),
        zod.object({
            drop: zod.any(),
        })
    );

    return Grid(
        ManageSongs(data),
        Horizontal(
            Spacer(),
            Button("Add a new Song")
                .onClick(() => createFilePicker(allowedAudioFormats.join(",")).then(file => uploadSongToDrop(data, file)))
        ),
        Button("Save Changes").onPromiseClick(async () => {
            validate();
            if (error) return;
            let obj = structuredClone(drop);
            data.map(x => x.data.data).forEach(x => obj = { ...obj, ...x });
            await API.music.id(drop._id).update(obj);
            location.reload(); // Handle this Smarter => Make it a Reload Event.
        })
    )
        .setGap("15px")
        .setPadding("15px 0 0 0");

    // return Wizard({
    //     submitAction: async (data) => {
    //         let obj = structuredClone(drop);
    //         data.map(x => x.data.data).forEach(x => obj = { ...obj, ...x });
    //         await API.music.id(drop._id).update(obj);
    //         location.reload(); // Handle this Smarter => Make it a Reload Event.
    //     },
    //     buttonArrangement: "flex-end",
    //     buttonAlignment: "top",
    // }, ({ PageData }) => [
    //     Page({
    //         uploadingSongs: <string[]>[],
    //         songs: drop.songs
    //     }, data => [
    //         Grid(
    //             ManageSongs(data),
    //             Horizontal(
    //                 Spacer(),
    //                 Button("Add a new Song")
    //                     .onClick(() => uploadFilesDialog((list) => uploadSongToDrop(data, getDropFromPages(PageData(), drop), list), allowedAudioFormats.join(",")))
    //             )
    //         )
    //             .setGap("15px")
    //             .setPadding("15px 0 0 0")
    //     ]).setValidator(() => pageFive)
    // ]
    // );
}