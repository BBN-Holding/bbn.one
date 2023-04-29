import { Box, CenterV, Entry, Image, PlainText, ReCache } from "webgen/mod.ts";
import { Drop, DropType } from "../../../spec/music.ts";
import { templateArtwork } from "../../../assets/imports.ts";
import { loadImage } from "../../manager/helper.ts";

export function DropEntry(x: Drop, small: boolean) {
    return Entry({
        title: x.title ?? "(no drop name)",
        subtitle: `${x.release ?? "(no release date)"} - ${x.upc ?? "(no upc number)"}`
    })
        .addClass("limited-width", small ? "small" : "normal")
        .addPrefix(ReCache("image-preview-" + x._id + small, () => Promise.resolve(), (type) => {
            const imageSource = type == "loaded" && x.artwork
                ? Image({ type: "direct", source: async () => await loadImage(x) ?? fetch(templateArtwork).then(x => x.blob()) }, "A Song Artwork")
                : Image(templateArtwork, "A Placeholder Artwork.");

            return Box(imageSource)
                .addClass("image-square");
        }))
        .addSuffix((() => {
            if (x.type == DropType.UnderReview)
                return CenterV(PlainText("Under Review")
                    .addClass("entry-subtitle", "under-review"));

            if (x.type == DropType.ReviewDeclined)
                CenterV(PlainText("Declined")
                    .addClass("entry-subtitle", "under-review"));

            return Box();
        })())
        .onClick(() => {
            x.type === DropType.Unsubmitted
                ? location.href = "/music/new-drop?id=" + x._id
                : location.href = "/music/edit?id=" + x._id;
        });
}