import { Center, MediaQuery, PlainText } from "webgen/mod.ts";
import { Drop } from "../RESTSpec.ts";
import { ViewState } from "../types.ts";

export function ExplainerText(state: Partial<ViewState>) {
    return state.list!
        .filter(x => state.type == "PUBLISHED" ? x.type == "PUBLISHED" : true)
        .filter(x => state.type == "PRIVATE" ? x.type == "PRIVATE" || x.type == "UNDER_REVIEW" : true)
        .filter(x => state.type == "UNSUBMITTED" ? x.type == "UNSUBMITTED" : true)
        .length == 0
        ?
        MediaQuery("(min-width: 540px)", (large) => large ? Center(
            PlainText(`You don’t have any ${EnumToDisplay(state.type)} Drops`)
                .setFont(1.6, 700)
        ).setMargin("100px 0 0") : PlainText(`You don’t have any ${EnumToDisplay(state.type)} Drops`).setMargin("100px auto 0").addClass("explainer-text")
            .setFont(1.6, 700))
        : null;
}

function EnumToDisplay(state?: Drop[ "type" ]) {
    switch (state) {
        case "PRIVATE": return "unpublished";
        case "PUBLISHED": return "published";
        default: return "";
    }
}

export function DropTypeToText(state?: Drop[ "type" ]) {
    switch (state) {
        case "PRIVATE": return "Unpublished";
        case "PUBLISHED": return "Published";
        case "UNDER_REVIEW": return "Under Review";
        case "UNSUBMITTED": return "Draft";
        default: return "";
    }
}