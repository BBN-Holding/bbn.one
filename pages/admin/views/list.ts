import { PlainText, Vertical } from "webgen/mod.ts";
import { state } from "../state.ts";
import { DropType } from "../../../spec/music.ts";
import { ReviewEntry } from "./entryReview.ts";

export function listReviews() {
    return Vertical(
        (state.reviews?.find(x => x.type == DropType.UnderReview)) ? [
            PlainText("Reviews")
                .addClass("list-title")
                .addClass("limited-width"),
            Vertical(...state.reviews.filter(x => x.type == DropType.UnderReview).map(x => ReviewEntry(x))).setGap("1rem"),
        ] : [
            PlainText("No Reviews")
                .addClass("list-title")
                .addClass("limited-width"),
            PlainText("All done! You are now allowed to lean back and relax. 🧋")
                .addClass("limited-width"),
        ],
        state.reviews!.filter(x => x.type == DropType.Publishing).length == 0 ? null :
            PlainText("Publishing")
                .addClass("list-title")
                .addClass("limited-width"),
        ...state.reviews!.filter(x => x.type == DropType.Publishing).map(x =>
            ReviewEntry(x)
        ),
        PlainText("Published")
            .addClass("list-title")
            .addClass("limited-width"),
        ...state.reviews!.filter(x => x.type == DropType.Published).map(x =>
            ReviewEntry(x)
        ),
        PlainText("Private")
            .addClass("list-title")
            .addClass("limited-width"),
        ...state.reviews!.filter(x => x.type == DropType.Private).map(x =>
            ReviewEntry(x)
        ),
        PlainText("Rejected")
            .addClass("list-title")
            .addClass("limited-width"),
        ...state.reviews!.filter(x => x.type == DropType.ReviewDeclined).map(x =>
            ReviewEntry(x)
        ),
        PlainText("Drafts")
            .addClass("list-title")
            .addClass("limited-width"),
        ...state.reviews!.filter(x => x.type == DropType.Unsubmitted).map(x =>
            ReviewEntry(x)
        )
    )
        .setGap("1rem");
}