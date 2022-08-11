import { Button, Horizontal, Page, PlainText, Spacer, Vertical, View, Wizard } from "webgen/mod.ts";
import { allowedAudioFormats, Table, UploadTable } from "../helper.ts";
import { ActionBar } from "../misc/actionbar.ts";
import { changePage, Validate } from "../misc/common.ts";
import { API, Drop } from "../RESTSpec.ts";
import { EditViewState } from "./types.ts";
import { DeleteFromForm, FormToRecord, RecordToForm } from "../data.ts";
import { TableData } from "../types.ts";
import { TableDef } from "./table.ts";
import { uploadFilesDialog } from "../upload.ts";
import { addSongsByDrop } from "./data.ts";

export function ChangeSongs(drop: Drop, update: (data: Partial<EditViewState>) => void) {
    return Wizard({
        cancelAction: () => { },
        submitAction: () => { },
    }, ({ PageValid, PageData, PageID }) => [
        Page(data => [
            ActionBar("Songs", undefined, {
                title: "Update", onclick: () => {
                    Validate(PageValid, async () => {
                        await API.music(API.getToken())
                            .id(drop._id)
                            .put(PageData()[ PageID() ]);
                        location.reload(); // Handle this Smarter => Make it a Reload Event.
                    });
                }
            }, [ { title: drop.title ?? "(no-title)", onclick: changePage(update, "main") } ]),
            PlainText("")
                .addClass("error-message", "limited-width")
                .setId("error-message-area"),
            View(({ update }) => Vertical(
                data.getAll("song").filter(x => x).length ?
                    Table<TableData>(
                        TableDef(data),
                        FormToRecord(data, "song", [])
                            .map(x => ({ Id: x.id }))
                    )
                        .setDelete(({ Id }) => {
                            DeleteFromForm(data, "song", (x) => x != Id);
                            update({});
                        })
                        .addClass("limited-width", "light-mode")
                    : UploadTable(TableDef(data), (list) => addSongsByDrop(drop, list, data, update))
                        .addClass("limited-width", "light-mode"),
                Horizontal(
                    Spacer(),
                    Button("Manual Upload")
                        .onClick(() => uploadFilesDialog((list) => addSongsByDrop(drop, list, data, update), allowedAudioFormats.join(",")))
                ).addClass("limited-width").setMargin("1rem auto 0")
            )).asComponent()
        ]).setDefaultValues(RecordToForm(new FormData(), "song", drop.song?.map(x => ({
            id: x.Id,
            title: x.Title,
            country: x.Country,
            primaryGenre: x.PrimaryGenre,
            year: x.Year?.toString(),
            artists: JSON.stringify(x.Artists),
            file: x.File,
            explicit: x.Explicit ? "true" : "false"
        })) ?? [])).addValidator((v) => v.object({
            loading: v.void(),
            song: v.string().or(v.array(v.string()))
        }))
    ]
    );
}