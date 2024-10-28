import { showPreviewImage } from "shared/helper.ts";
import { placeholder } from "shared/mod.ts";
import { CenterV, Component, Empty, Entry, Image, isMobile, Label, Vertical } from "webgen/mod.ts";
import { templateArtwork } from "../../../assets/imports.ts";
import { type Artist, Drop, DropType } from "../../../spec/music.ts";

export function DropEntry(x: Drop) {
    return Entry({
        title: x.title ?? "(no drop name)",
        subtitle: `${x.release ?? "(no release date)"} - ${x.gtin ?? "(no GTIN)"}`,
    })
        .addClass(isMobile.map((mobile) => mobile ? "small" : "normal"))
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

export function ArtistEntry(x: Artist) {
    return Entry({
        title: x.name,
        // TODO: Add used on x songs, x drops, maybe even streams?
    })
        //TODO: links
        // .addSuffix(
        //     Horizontal(
        //         LinkButton("Spotify", "fdgdf"),
        //         LinkButton("Apple Music", "fdgdf"),
        //     ).setGap(),
        // )
        .addPrefix(Image(templateArtwork, "Artist Profile Picture").addClass("image-square"))
        .addClass(isMobile.map((mobile) => mobile ? "small" : "normal"));
}

export const musicList = (list: Drop[], type: DropType) =>
    Vertical(
        CategoryRender(
            list.filter((_, i) => i == 0),
            "Latest Drop",
        ),
        CategoryRender(
            list.filter((_, i) => i > 0),
            "History",
        ),
        list.length == 0 ? placeholder("No Drops", `You don’t have any ${EnumToDisplay(type)} Drops`) : null,
    )
        .setGap("20px");

export function CategoryRender(dropList: Drop[], title: string): Component[] | null {
    if (dropList.length == 0) {
        return null;
    }
    return [
        Label(title)
            .addClass("list-title"),
        Vertical(...dropList.map((x) => DropEntry(x))).setGap("1rem"),
    ];
}

export function EnumToDisplay(state: DropType) {
    return state === "PUBLISHED" ? "published" : "";
}

export function DropTypeToText(type: DropType) {
    return (<Record<DropType, string>> {
        "PRIVATE": "Private",
        "PUBLISHED": "Published",
        "UNDER_REVIEW": "Under Review",
        "UNSUBMITTED": "Draft",
        "REVIEW_DECLINED": "Rejected",
    })[type];
}
