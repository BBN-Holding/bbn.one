import { CenterV, Empty, Entry, Label } from "webgen/mod.ts";
import { Drop, DropType } from "../../../spec/music.ts";
import { showPreviewImage } from "../../_legacy/helper.ts";

export function DropEntry(x: Drop, small: boolean) {
    return Entry({
        title: x.title ?? "(no drop name)",
        subtitle: `${x.release ?? "(no release date)"} - ${x.gtin ?? "(no GTIN)"}`,
    })
        .addClass(small ? "small" : "normal")
        .addPrefix(showPreviewImage(x).addClass("image-square"))
        .addSuffix((() => {
            if (x.type == DropType.UnderReview) {
                return CenterV(
                    Label("Under Review")
                        .addClass("entry-subtitle", "under-review"),
                );
            }

            if (x.type == DropType.ReviewDeclined) {
                return CenterV(
                    Label("Declined")
                        .addClass("entry-subtitle", "under-review"),
                );
            }

            return Empty();
        })())
        .onClick(() => location.href = x.type === DropType.Unsubmitted ? `/c/music/new-drop?id=${x._id}` : `/c/music/edit?id=${x._id}`);
}
