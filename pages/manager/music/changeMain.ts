import { Box, Custom, Grid, img, Page, Vertical, Wizard } from "webgen/mod.ts";
import { ActionBar } from "../misc/actionbar.ts";
import { changePage } from "../misc/common.ts";
import { DownloadDrop } from "../misc/drop.ts";
import { Entry } from "../misc/Entry.ts";
import { Drop } from "../RESTSpec.ts";
import { EditViewState } from "./types.ts";

export function ChangeMain(data: Drop, update: (data: Partial<EditViewState>) => void) {
    return Wizard({
        cancelAction: () => { },
        submitAction: () => { },
    }, () => [
        Page(_ => [
            Grid(
                Box(
                    Custom(img(data[ "artwork-url" ])).addClass("upload-image"),
                )
                    .addClass("image-edit", "small"),
            )
                .setEvenColumns(1, "10rem")
                .addClass("limited-width")
                .setMargin("3rem auto -3rem"),
            ActionBar(data.title ?? "(no title)"),
            Vertical(
                Entry("Drop", "Change Title, Release Date, ...", changePage(update, "edit-drop")),
                Entry("Songs", "Move Songs, Remove Songs, Add Songs, ...", changePage(update, "edit-songs")),
                Entry("Additional Data", "Change Release Date/Time, Store, Regions, ..."),
                Entry("Export", "Download your complete Drop with every Song", () => DownloadDrop(data)),
                Entry("Takedown", "Completely Takedown your Drop")
                    .addClass("entry-alert"),
            )
                .setMargin("0 0 22px")
                .setGap("22px")
        ])
    ]
    );
}