import { API } from "shared/mod.ts";
import { asState, Button, ButtonStyle, Color, DropDownInput, Entry, Horizontal, SheetDialog, Spacer, Vertical } from "webgen/mod.ts";
import { Drop, DropType } from "../../../spec/music.ts";
import { sheetStack, showPreviewImage } from "../../shared/helper.ts";

export function ReviewEntry(x: Drop) {
    return Entry({
        title: x.title ?? "(no drop name)",
        subtitle: `release: ${x.release ?? "(no release date)"} - user: ${x.user} - gtin: ${x.gtin ?? "(no GTIN)"} - id: ${x._id} - type: ${x.type}`,
    })
        .addClass("small")
        .addSuffix(
            Button("Review")
                .setStyle(ButtonStyle.Inline)
                .setColor(Color.Colored)
                .addClass("tag")
                .onClick(() => location.href = `/admin/review?id=${x._id}`),
        )
        .addPrefix(showPreviewImage(x).addClass("image-square"));
}

export const changeState = asState({
    drop: <Drop | undefined> undefined,
    type: <DropType | undefined> undefined,
});

export const changeTypeDialog = SheetDialog(
    sheetStack,
    "Change Drop Type",
    Vertical(
        DropDownInput("Change Type", Object.values(DropType)).ref(changeState.$type),
        Horizontal(
            Spacer(),
            Button("Change").onPromiseClick(async () => {
                await API.music.id(changeState.drop!._id).type.post(changeState.type!);
                changeTypeDialog.close();
            }),
        ),
    ),
);
