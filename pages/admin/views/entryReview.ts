import { API } from "shared/mod.ts";
import { Button, ButtonStyle, Color, DropDownInput, Entry, Horizontal, SheetDialog, Spacer, Vertical, asState } from "webgen/mod.ts";
import { Drop, DropType } from "../../../spec/music.ts";
import { sheetStack, showPreviewImage } from "../../_legacy/helper.ts";

export function ReviewEntry(x: Drop) {
    return Entry({
        title: x.title ?? "(no drop name)",
        subtitle: `${x.release ?? "(no release date)"} - ${x.user} - ${x.upc ?? "(no upc number)"} - ${x._id}`
    })
        .addClass("small")
        .addSuffix(Button("Review")
            .setStyle(ButtonStyle.Inline)
            .setColor(Color.Colored)
            .addClass("tag")
            .onClick(() => location.href = `/admin/review?id=${x._id}`))
        .addPrefix(showPreviewImage(x).addClass("image-square"));
}

export const changeState = asState({
    drop: <Drop | undefined>undefined,
    type: <DropType | undefined>undefined
});

export const changeTypeDialog = SheetDialog(sheetStack, "Change Drop Type",
    Vertical(
        DropDownInput("Change Type", Object.values(DropType)).sync(changeState, "type"),
        Horizontal(
            Spacer(),
            Button("Change").onClick(() => {
                API.music.id(changeState.drop!._id).type.post(changeState.type!);
                changeTypeDialog.close();
            })
        )
    )
);