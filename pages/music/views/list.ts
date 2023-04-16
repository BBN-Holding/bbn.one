import { Component, MediaQuery, PlainText, Vertical } from "webgen/mod.ts";
import { Drop, DropType } from "../../../spec/music.ts";
import { DropEntry, ExplainerText } from "./entry.ts";

export const musicList = (list: Drop[], type: DropType) => Vertical(
    CategoryRender(
        list
            .filter((_, i) => i == 0),
        "Latest Drop"
    ),
    CategoryRender(
        list
            .filter((_, i) => i > 0),
        "History"
    ),
    ExplainerText(list, type)
)
    .setGap("20px");


function CategoryRender(dropList: Drop[], title: string): Component | (Component | null)[] | null {
    if (dropList.length == 0)
        return null;
    return [
        PlainText(title)
            .addClass("list-title")
            .addClass("limited-width"),
        MediaQuery("(max-width: 700px)",
            (matches) =>
                Vertical(...dropList.map(x => DropEntry(x, matches))).setGap("1rem")
        ),
    ];
}