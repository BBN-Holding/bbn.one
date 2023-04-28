import { CenterV, Component, MediaQuery, PlainText, Vertical } from "webgen/mod.ts";
import { Drop, DropType, Payout } from "../../../spec/music.ts";
import { DropEntry } from "./entry.ts";
import { Entry } from "../../manager/misc/Entry.ts";
import { sortBy } from "https://deno.land/std@0.185.0/collections/sort_by.ts";

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

export function listPayouts(payouts: Payout[]) {
    return payouts && payouts.length > 0 ? [
        PlainText("Payouts")
            .addClass("list-title")
            .addClass("limited-width"),
        Vertical(sortBy(payouts, e => e.period).reverse().map(x =>
            Entry(
                x.period,
                x.moneythisperiod,
                () => {
                    location.href = `/music/payout?id=${x._id}`
                }
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