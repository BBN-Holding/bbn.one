import { CenterV, Component, Horizontal, MediaQuery, PlainText, Spacer } from "webgen/mod.ts";
import { Drop, DropType } from "../../../spec/music.ts";
import { showPreviewImage } from "../../manager/helper.ts";

export function DropEntry(x: Drop, matches: boolean): Component {
    return Horizontal(
        showPreviewImage(x),
        CenterV(
            PlainText(x.title ?? "(no name)")
                .setMargin("-0.4rem 0 0")
                .setFont(matches ? 1.2 : 2.25, 700),
            PlainText(x.release ?? "(no release date)")
                .setFont(matches ? 0.8 : 1, 700)
                .addClass("entry-subtitle")
        ),
        CenterV(
            PlainText(x.upc ? `UPC ${x.upc}` : "(no upc number)")
                .addClass("entry-subtitle")
                .setFont(matches ? 0.8 : 1, 700)
        ),
        Spacer(),
        x.type == DropType.UnderReview
            ? CenterV(PlainText("Under Review")
                .addClass("entry-subtitle", "under-review"))
            : null,
        x.type == DropType.ReviewDeclined
            ? CenterV(PlainText("Declined")
                .addClass("entry-subtitle", "under-review"))
            : null
    )
        .setGap("40px")
        .addClass("list-entry", "action", "limited-width")
        .onClick(() => x.type === DropType.Unsubmitted ? location.href = "/music/new-drop?id=" + x._id : location.href = "/music/edit?id=" + x._id);
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