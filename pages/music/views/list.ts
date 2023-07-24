import { sortBy } from "std/collections/sort_by.ts";
import { CenterV, Component, Entry, Label, MediaQuery, Vertical } from "webgen/mod.ts";
import { Drop, DropType, Payout } from "../../../spec/music.ts";
import { activeUser, permCheck } from "../../_legacy/helper.ts";
import { DropEntry } from "./entry.ts";

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
        Label(title)
            .addClass("list-title"),
        MediaQuery("(max-width: 700px)",
            (matches) =>
                Vertical(...dropList.map(x =>
                    DropEntry(x, matches)
                )).setGap("1rem")
        ),
    ];
}

export function listPayouts(payouts: Payout[], admin = false) {
    return Vertical(payouts && payouts.length > 0 ? [
        Label("Payouts")
            .addClass("list-title")
            .addClass("limited-width")
            .setMargin("0 auto 1rem"),
        Vertical(sortBy(payouts, e => e.period).reverse().map(x =>
            Entry({
                title: x.period,
                subtitle: x.moneythisperiod,
            }).onClick(() => {
                location.href = `/music/payout?id=${x._id}${(!admin && permCheck("/hmsys/user/manage", "/bbn/manage")) ? `&userid=${activeUser.id}` : ""}`;
            })
        )).setGap("1rem"),
    ] : [
        Label("No Payouts")
            .addClass("list-title")
            .addClass("limited-width"),
        Label("Release new Drops to earn money"),
    ]);
}

export function ExplainerText(drop: Drop[], type: DropType) {
    return drop.length == 0 ?
        MediaQuery("(min-width: 540px)", (large) => large ? CenterV(
            Label(`You don’t have any ${EnumToDisplay(type)} Drops`)
                .setFont(1.6, 700)
        ).setMargin("100px 0 0") : Label(`You don’t have any ${EnumToDisplay(type)} Drops`)
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
    })[ type ?? DropType.Unsubmitted ] ?? "";
}