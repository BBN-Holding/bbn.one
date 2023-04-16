import { CenterV, Component, Horizontal, PlainText, Spacer } from "webgen/mod.ts";
import { Drop, DropType } from "../../../spec/music.ts";
import { showPreviewImage } from "../../manager/helper.ts";

export function DropEntry(x: Drop, matches: boolean): Component {
    return Horizontal(
        showPreviewImage(x),
        CenterV(
            PlainText(x.title ?? "(no name)")
                .setMargin("-0.4rem 0 0")
                .setFont(matches ? 1.2 : 2.25, 700),
            PlainText(x.release ?? "(no release date)")
                .setFont(matches ? 0.8 : 1, 700)
                .addClass("entry-subtitle")
        ),
        CenterV(
            PlainText(x.upc ? `UPC ${x.upc}` : "(no upc number)")
                .addClass("entry-subtitle")
                .setFont(matches ? 0.8 : 1, 700)
        ),
        Spacer(),
        x.type == DropType.UnderReview
            ? CenterV(PlainText("Under Review")
                .addClass("entry-subtitle", "under-review"))
            : null,
        x.type == DropType.ReviewDeclined
            ? CenterV(PlainText("Declined")
                .addClass("entry-subtitle", "under-review"))
            : null
    )
        .setGap("40px")
        .addClass("list-entry", "action", "limited-width")
        .onClick(() => x.type === DropType.Unsubmitted ? location.href = "/music/new-drop?id=" + x._id : location.href = "/music/edit?id=" + x._id);
}