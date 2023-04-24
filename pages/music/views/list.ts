import { CenterV, Component, MediaQuery, PlainText, Vertical } from "webgen/mod.ts";
import { Drop, DropType } from "../../../spec/music.ts";
import { DropEntry } from "./entry.ts";
import { state } from "../state.ts";
import { Entry } from "../../manager/misc/Entry.ts";

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

export function listPayouts() {
    return state.payouts && state.payouts.length > 0 ? [
        PlainText("Payouts")
            .addClass("list-title")
            .addClass("limited-width"),
        Vertical(state.payouts!.sort((a, b) => new Date(b.period?.split(" ")[1]!).getTime() - new Date(a.period?.split(" ")[1]!).getTime()).map(x =>
            Entry(
                x.period ?? "",
                x.moneythisperiod
            )
        )).setGap("1rem"),
    ] : [
        PlainText("No Payouts")
            .addClass("list-title")
            .addClass("limited-width"),
        PlainText("Release new Drops to earn money")
            .addClass("limited-width"),
    ];
}

export function ExplainerText(drop: Drop[], type: DropType) {
    return drop.length == 0 ?
        MediaQuery("(min-width: 540px)", (large) => large ? CenterV(
            PlainText(`You don’t have any ${EnumToDisplay(type)} Drops`)
                .setFont(1.6, 700)
        ).setMargin("100px 0 0") : PlainText(`You don’t have any ${EnumToDisplay(type)} Drops`)
            .setFont(1.6, 700))
            .setMargin("100px auto 0")
            .addClass("explainer-text")
        : null;
}

function EnumToDisplay(state?: DropType) {
    switch (state) {
        case "PRIVATE": return "unpublished";
        case "PUBLISHED": return "published";
        default: return "";
    }
}

export function DropTypeToText(type?: DropType) {
    return (<Record<DropType, string>>{
        "PRIVATE": "Private",
        "PUBLISHED": "Published",
        "UNDER_REVIEW": "Under Review",
        "UNSUBMITTED": "Draft",
        "REVIEW_DECLINED": "Rejected"
    })[type ?? DropType.Unsubmitted] ?? "";
}