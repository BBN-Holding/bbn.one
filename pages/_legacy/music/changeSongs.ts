import { API, uploadFilesDialog } from "shared";
import { Button, Grid, Horizontal, Page, Spacer, Wizard } from "webgen/mod.ts";
import { Drop, pageFive } from "../../../spec/music.ts";
import { allowedAudioFormats, getDropFromPages } from "../helper.ts";
import { uploadSongToDrop } from "./data.ts";
import { ManageSongs } from "./table.ts";

export function ChangeSongs(drop: Drop) {
    return Wizard({
        submitAction: async (data) => {
            let obj = structuredClone(drop);
            data.map(x => x.data.data).forEach(x => obj = { ...obj, ...x });
            await API.music.id(drop._id).update(obj);
            location.reload(); // Handle this Smarter => Make it a Reload Event.
        },
        buttonArrangement: "flex-end",
        buttonAlignment: "top",
    }, ({ PageData }) => [
        Page({
            uploadingSongs: <string[]>[],
            songs: drop.songs
        }, data => [
            Grid(
                ManageSongs(data),
                Horizontal(
                    Spacer(),
                    Button("Add a new Song")
                        .onClick(() => uploadFilesDialog((list) => uploadSongToDrop(data, getDropFromPages(PageData(), drop), list), allowedAudioFormats.join(",")))
                )
            )
                .setGap("15px")
                .setPadding("15px 0 0 0")
        ]).setValidator(() => pageFive)
    ]
    );
}