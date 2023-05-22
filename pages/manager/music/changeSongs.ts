import { API, uploadFilesDialog } from "shared";
import { Button, Grid, Horizontal, Page, Spacer, Wizard } from "webgen/mod.ts";
import { Drop, pageFive } from "../../../spec/music.ts";
import { allowedAudioFormats, getDropFromPages } from "../helper.ts";
import { ActionBar } from "../misc/actionbar.ts";
import { changePage, HandleSubmit, setErrorMessage } from "../misc/common.ts";
import { uploadSongToDrop } from "./data.ts";
import { ManageSongs } from "./table.ts";
import { EditViewState } from "./types.ts";

export function ChangeSongs(drop: Drop, update: (data: Partial<EditViewState>) => void) {
    return Wizard({
        submitAction: async (data) => {
            let obj = structuredClone(drop);
            data.map(x => x.data.data).forEach(x => obj = { ...obj, ...x });

            // deno-lint-ignore no-explicit-any
            await API.music(API.getToken()).id(drop._id).post(<any>obj);

            location.reload(); // Handle this Smarter => Make it a Reload Event.
        },
        buttonArrangement: ({ PageValid, Submit }) => {
            setErrorMessage();
            return ActionBar("Songs", undefined, {
                title: "Update", onclick: HandleSubmit(PageValid, Submit)
            }, [ { title: drop.title || "(no title)", onclick: changePage(update, "main") } ]);
        },
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
                .addClass("limited-width")
        ]).setValidator(() => pageFive)
    ]
    );
}