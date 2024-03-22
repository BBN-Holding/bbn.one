import { placeholder } from "shared/mod.ts";
import { Component, Label, MediaQuery, Vertical } from "webgen/mod.ts";
import { Drop, DropType } from "../../../spec/music.ts";
import { DropEntry } from "./entry.ts";

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

function CategoryRender(dropList: Drop[], title: string): Component[] | null {
    if (dropList.length == 0) {
        return null;
    }
    return [
        Label(title)
            .addClass("list-title"),
        MediaQuery("(max-width: 700px)", (matches) => Vertical(...dropList.map((x) => DropEntry(x, matches))).setGap("1rem")),
    ];
}

function EnumToDisplay(state: DropType) {
    switch (state) {
        case "PRIVATE":
            return "unpublished";
        case "PUBLISHED":
            return "published";
        default:
            return "";
    }
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
