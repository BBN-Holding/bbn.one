import { Box, Button, ButtonStyle, CenterV, Color, Dialog, DropDownInput, Entry, MIcon, State, Vertical } from "webgen/mod.ts";
import { Drop, DropType } from "../../../spec/music.ts";
import { showPreviewImage } from "../../_legacy/helper.ts";
import { API } from "../../shared/restSpec.ts";
import { ReviewDialog, state } from "../dialog.ts";
import { refreshState } from "../loading.ts";

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
        .addSuffix(Button(MIcon("bug_report"))
            .setStyle(ButtonStyle.Inline)
            .setColor(Color.Colored)
            .addClass("tag")
            .onClick(() => {
                changeTypeDialog.open();
                changeState.drop = x;
                changeState.type = x.type;
                changeTypeDialog.onClose(() => refreshState());
            })
        )
        .addSuffix(Box(...ReviewActions(x)))
        .addPrefix(showPreviewImage(x).addClass("image-square"));
}

function ReviewActions(x: Drop) {
    return [
        ...x.type == "UNDER_REVIEW" ? [
            CenterV(
                Button(MIcon("done_all"))
                    .setStyle(ButtonStyle.Inline)
                    .setColor(Color.Colored)
                    .addClass("tag")
                    .onClick(() => {
                        ReviewDialog.open();
                        state.drop = x;
                        ReviewDialog.onClose(() => refreshState());
                    })
            ),
        ] : []
    ];
}

const changeState = State({
    drop: <Drop | undefined>undefined,
    type: <DropType | undefined>undefined
});

const changeTypeDialog = Dialog(() =>
    Vertical(
        DropDownInput("Change Type", Object.values(DropType)).sync(changeState, "type")
    )
)
    .addButton("Change", () => {
        API.music.id(changeState.drop!._id).type.post(changeState.type!);
        changeTypeDialog.close();
    })
    .allowUserClose()
    .setTitle("Change Drop Type");