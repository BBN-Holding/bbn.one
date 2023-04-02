import { Button, ButtonStyle, Color, Horizontal, PlainText, Spacer, Vertical, CenterV, Component, Icon, ViewClass, MediaQuery } from "webgen/mod.ts";
import { Drop, DropType } from "../../../spec/music.ts";
import { loadSongs, showPreviewImage } from "../helper.ts";
import { API } from "../RESTSpec.ts";
import { ViewState } from "../types.ts";
import { ReviewDialog } from "./dialog.ts";

export function ReviewPanel(view: () => ViewClass<ViewState>, state: Partial<ViewState>): Component {
    return Vertical(
        (state.reviews?.find(x => x.type == DropType.UnderReview)) ? [
            PlainText("Reviews")
                .addClass("list-title")
                .addClass("limited-width"),
            Vertical(...state.reviews!.filter(x => x.type == DropType.UnderReview).map(x => RenderEntry(x, view))).setGap("1rem"),
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
            RenderEntry(x, view)
        ),
        PlainText("Published")
            .addClass("list-title")
            .addClass("limited-width"),
        ...state.reviews!.filter(x => x.type == DropType.Published).map(x =>
            RenderEntry(x, view)
        ),
        PlainText("Private")
            .addClass("list-title")
            .addClass("limited-width"),
        ...state.reviews!.filter(x => x.type == DropType.Private).map(x =>
            RenderEntry(x, view)
        ),
        PlainText("Rejected")
            .addClass("list-title")
            .addClass("limited-width"),
        ...state.reviews!.filter(x => x.type == DropType.ReviewDeclined).map(x =>
            RenderEntry(x, view)
        ),
        PlainText("Drafts")
            .addClass("list-title")
            .addClass("limited-width"),
        ...state.reviews!.filter(x => x.type == DropType.Unsubmitted).map(x =>
            RenderEntry(x, view)
        )
    )
        .setGap("1rem")
        .setMargin("1rem 0");
}

function RenderEntry(x: Drop, view: () => ViewClass<ViewState>) {
    return MediaQuery("(max-width: 880px)", (small) => small ? Vertical(
        Horizontal(
            showPreviewImage(x).addClass("small-preview"),
            Vertical(
                PlainText(x.title ?? "(no text)")
                    .setMargin("-0.4rem 0 0")
                    .setFont(2, 700),
                MediaQuery("(max-width: 530px)", (small) => small ? Vertical(
                    PlainText(x._id),
                    PlainText(x.user ?? "(no user)")
                ) : PlainText(x._id + " - " + x.user))

            ),
            Spacer()
        ),
        Horizontal(
            Spacer(),
            CenterV(
                Button("Edit")
                    .setStyle(ButtonStyle.Inline)
                    .setColor(Color.Colored)
                    .addClass("tag")
                    .onClick(() => location.href = "/music/edit?id=" + x._id)
            ),
            ReviewActions(x, view())
        )
    ).setPadding("0.5rem")
        .setGap("0.8rem")
        .addClass("list-entry")
        .addClass("limited-width")
        :
        Horizontal(
            showPreviewImage(x).addClass("small-preview"),
            Vertical(
                PlainText(x.title ?? "(no text)")
                    .setMargin("-0.4rem 0 0")
                    .setFont(2, 700),
                PlainText(x._id + " - " + x.user)
            ),
            Spacer(),
            CenterV(
                Button("Edit")
                    .setStyle(ButtonStyle.Inline)
                    .setColor(Color.Colored)
                    .addClass("tag")
                    .onClick(() => location.href = "/music/edit?id=" + x._id)
            ),
            ReviewActions(x, view())
        )
            .setPadding("0.5rem")
            .addClass("list-entry")
            .addClass("limited-width")
    );
}

function ReviewActions(x: Drop, view: ViewClass<ViewState>) {
    return [
        ...x.type == "UNDER_REVIEW" ? [
            CenterV(
                Button(Icon("done_all"))
                    .setStyle(ButtonStyle.Inline)
                    .setColor(Color.Colored)
                    .addClass("tag")
                    .onClick(() => {
                        ReviewDialog.open().viewOptions().update({
                            drop: x
                        });
                        ReviewDialog.onClose(async () => await loadSongs(view));
                    })
            ),
        ] : [],
        ...x.type == "PUBLISHING" ? [
            CenterV(
                Button(Icon("bug_report"))
                    .setStyle(ButtonStyle.Inline)
                    .setColor(Color.Colored)
                    .addClass("tag")
                    .onPromiseClick(async () => {
                        await API.music(API.getToken()).id(x._id).type.post(DropType.Publishing);
                    })
            ),
        ] : [],
    ];
}