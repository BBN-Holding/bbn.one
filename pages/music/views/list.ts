import { showPreviewImage } from "shared/helper.ts";
import { placeholder } from "shared/list.ts";
import { asRef, Box, Empty, Entry, Grid, Image, Label } from "webgen/mod.ts";
import { templateArtwork } from "../../../assets/imports.ts";
import { type Artist, Drop, DropType } from "../../../spec/music.ts";

export function DropEntry(x: Drop) {
    return Entry(Grid(
        Label(x.title ?? "(no drop name)"),
        Label(`${x.release ?? "(no release date)"} - ${x.gtin ?? "(no GTIN)"}`),
    ))
        .addPrefix(showPreviewImage(x))
        .addSuffix((() => {
            if (x.type == DropType.UnderReview) {
                return Label("Under Review");
            }

            if (x.type == DropType.ReviewDeclined) {
                return Label("Declined");
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
        .addPrefix(Image(templateArtwork, "Artist Profile Picture"));
}

export const musicList = (list: Drop[], type: DropType) =>
    Grid(
        CategoryRender(
            list.filter((_, i) => i == 0),
            "Latest Drop",
        ),
        CategoryRender(
            list.filter((_, i) => i > 0),
            "History",
        ),
        list.length == 0 ? placeholder("No Drops", `You don’t have any ${EnumToDisplay(type)} Drops`) : Empty(),
    )
        .setGap("20px");

export function CategoryRender(dropList: Drop[], title: string) {
    if (dropList.length == 0) {
        return Empty();
    }
    return Box(
        Label(title),
        Grid(asRef(dropList.map((x) => DropEntry(x)))).setGap("1rem"),
    );
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
