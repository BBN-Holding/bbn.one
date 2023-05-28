import { sortBy } from "std/collections/sort_by.ts";
import { CenterV, Component, css, Entry, MediaQuery, PlainText, Vertical } from "webgen/mod.ts";
import { Drop, DropType, Payout } from "../../../spec/music.ts";
import { activeUser, permCheck } from "../../manager/helper.ts";
import { DropEntry } from "./entry.ts";

document.adoptedStyleSheets.push(css`
    .image-square {
        height: 5rem;
        aspect-ratio: 1 / 1;
        border-radius: 15px;
    }
    .small .image-square {
        height: 44px;
    }
    .image-square .wimage {
        height: 100%;
        width: 100%;
    }
`);

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
                Vertical(...dropList.map(x =>
                    DropEntry(x, matches)
                )).setGap("1rem")
        ),
    ];
}

export function listPayouts(payouts: Payout[], admin = false) {
    return Vertical(payouts && payouts.length > 0 ? [
        PlainText("Payouts")
            .addClass("list-title")
            .addClass("limited-width"),
        Vertical(sortBy(payouts, e => e.period).reverse().map(x =>
            Entry({
                title: x.period,
                subtitle: x.moneythisperiod,
            }).onClick(() => {
                location.href = `/music/payout?id=${x._id}${(!admin && permCheck("/hmsys/user/manage", "/bbn/manage")) ? `&userid=${activeUser.id}` : ""}`;
            }).addClass("limited-width")
        )).setGap("1rem"),
    ] : [
        PlainText("No Payouts")
            .addClass("list-title")
            .addClass("limited-width"),
        PlainText("Release new Drops to earn money")
            .addClass("limited-width"),
    ])
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
    })[ type ?? DropType.Unsubmitted ] ?? "";
}