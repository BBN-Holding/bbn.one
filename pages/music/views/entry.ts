import { Box, Cache, CenterV, Entry, Image, Label } from "webgen/mod.ts";
import { templateArtwork } from "../../../assets/imports.ts";
import { Drop, DropType } from "../../../spec/music.ts";
import { loadImage } from "../../_legacy/helper.ts";

export function DropEntry(x: Drop, small: boolean) {
    return Entry({
        title: x.title ?? "(no drop name)",
        subtitle: `${x.release ?? "(no release date)"} - ${x.upc ?? "(no upc number)"}`
    })
        .addClass(small ? "small" : "normal")
        .addPrefix(Cache(`image-preview-${x._id}${small}`, () => Promise.resolve(), (type) => {
            const imageSource = type == "loaded" && x.artwork
                ? Image({ type: "direct", source: async () => await loadImage(x) ?? fetch(templateArtwork).then(x => x.blob()) }, "A Song Artwork")
                : Image(templateArtwork, "A Placeholder Artwork.");

            return Box(imageSource)
                .addClass("image-square");
        }))
        .addSuffix((() => {
            if (x.type == DropType.UnderReview)
                return CenterV(Label("Under Review")
                    .addClass("entry-subtitle", "under-review"));

            if (x.type == DropType.ReviewDeclined)
                CenterV(Label("Declined")
                    .addClass("entry-subtitle", "under-review"));

            return Box();
        })())
        .onClick(() => location.href = x.type === DropType.Unsubmitted ? `/music/new-drop?id=${x._id}` : `/music/edit?id=${x._id}`);
}