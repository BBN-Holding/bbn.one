import { Box, Custom, Grid, Horizontal, Image, img, Page, PlainText, Spacer, Vertical, Wizard } from "webgen/mod.ts";
import { Drop, DropType } from "../../../spec/music.ts";
import { GetCachedProfileData, loadImage, showPreviewImage } from "../helper.ts";
import { ActionBar } from "../misc/actionbar.ts";
import { changePage } from "../misc/common.ts";
import { DownloadDrop } from "../misc/drop.ts";
import { Entry } from "../misc/Entry.ts";
import { API } from "../RESTSpec.ts";
import { DropTypeToText } from "./text.ts";
import { EditViewState } from "./types.ts";

export function ChangeMain(data: Drop, update: (data: Partial<EditViewState>) => void) {
    return Wizard({
        submitAction: () => { },
    }, () => [
        Page({}, _ => [
            Grid(
                showPreviewImage(data)
            )
                .setEvenColumns(1, "10rem")
                .addClass("limited-width")
                .setMargin("3rem auto -3rem"),
            ActionBar(data.title ?? "(no title)"),
            Horizontal(
                PlainText(DropTypeToText(data.type)),
                Spacer()
            ).addClass("limited-width").setMargin("-1rem auto 2rem"),
            Vertical(
                Permissions.canEdit(data) ? [
                    Entry("Drop", "Change Title, Release Date, ...", changePage(update, "edit-drop")),
                    Entry("Songs", "Move Songs, Remove Songs, Add Songs, ...", changePage(update, "edit-songs")),
                    // Entry("Additional Data", "Change Release Date/Time, Store, Regions, ..."),
                ] : null,
                // TODO: Add Read-Only Mode for Drop and Songs

                Entry("Export", "Download your complete Drop with every Song", () => DownloadDrop(data)),

                !Permissions.canCancelReview(data) ? null :
                    Entry("Cancel Review", "Need to change Something? Cancel it now", async () => {
                        await API.music(API.getToken()).id(data._id).type.post(DropType.Private);
                        location.reload();
                    }),
                !Permissions.canSubmit(data) ? null :
                    Entry("Publish", "Submit your Drop for Approval", async () => {
                        await API.music(API.getToken()).id(data._id).type.post(DropType.UnderReview);
                        location.reload();
                    }),

                !Permissions.canTakedown(data) ? null :
                    Entry("Takedown", "Completely Takedown your Drop", async () => {
                        await API.music(API.getToken()).id(data._id).type.post(DropType.Private);
                        location.reload();
                    }).addClass("entry-alert"),

            )
                .setMargin("0 0 22px")
                .setGap("22px")
        ])
    ]
    );
}

const Permissions = {
    canTakedown: (drop: Drop) => drop.type == "PUBLISHED",
    canSubmit: (drop: Drop) => (<Drop[ "type" ][]>[ "UNSUBMITTED", "PRIVATE" ]).includes(drop.type),
    canEdit: (drop: Drop) => (drop.type == "PRIVATE" || drop.type == "UNSUBMITTED") || API.permission.canReview(GetCachedProfileData().groups),
    canCancelReview: (drop: Drop) => drop.type == "UNDER_REVIEW"
};