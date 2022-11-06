import { Button, ButtonStyle, Color, Horizontal, PlainText, Spacer, Vertical, Custom, img, CenterV, Component, Icon, ViewClass } from "webgen/mod.ts";
import { loadSongs, MediaQuery } from "../helper.ts";
import { API, Drop } from "../RESTSpec.ts";
import artwork from "../../../assets/img/template-artwork.png";
import { ViewState } from "../types.ts";

export function ReviewPanel(imageCache: Map<string, string>, view: () => ViewClass<ViewState>, state: Partial<ViewState>): Component {
    return Vertical(
        (state.reviews?.find(x => x.type == "UNDER_REVIEW")) ? [
            PlainText("Reviews")
                .addClass("list-title")
                .addClass("limited-width"),
            Vertical(...state.reviews!.filter(x => x.type == "UNDER_REVIEW").map(x => RenderEntry(imageCache, x, view))).setGap("1rem"),
        ] : [ PlainText("No Reviews")
            .addClass("list-title")
            .addClass("limited-width") ],
        PlainText("").setMargin("1rem 0"),
        PlainText("Published")
            .addClass("list-title")
            .addClass("limited-width"),
        ...state.reviews!.filter(x => x.type == "PUBLISHED").map(x =>
            RenderEntry(imageCache, x, view)
        ),
        PlainText("Private")
            .addClass("list-title")
            .addClass("limited-width"),
        ...state.reviews!.filter(x => x.type == "PRIVATE").map(x =>
            RenderEntry(imageCache, x, view)
        ),
        PlainText("Drafts")
            .addClass("list-title")
            .addClass("limited-width"),
        ...state.reviews!.filter(x => x.type == "UNSUBMITTED").map(x =>
            RenderEntry(imageCache, x, view)
        )
    )
        .setGap("1rem")
        .setMargin("1rem 0");
}

function RenderEntry(imageCache: Map<string, string>, x: Drop, view: () => ViewClass<ViewState>) {
    return MediaQuery("(max-width: 880px)", (small) => small ? Vertical(
        Horizontal(
            Custom(img(imageCache.get(x._id) ?? artwork)).addClass("small-preview"),
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
            ReviewActions(x, imageCache, view())
        )
    ).setPadding("0.5rem")
        .setGap("0.8rem")
        .addClass("list-entry")
        .addClass("limited-width")
        :
        Horizontal(
            Custom(img(imageCache.get(x._id) ?? artwork)).addClass("small-preview"),
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
            ReviewActions(x, imageCache, view())
        )
            .setPadding("0.5rem")
            .addClass("list-entry")
            .addClass("limited-width")
    );
}

function ReviewActions(x: Drop, imageCache: Map<string, string>, view: ViewClass<ViewState>) {
    return x.type == "UNDER_REVIEW" ? [
        CenterV(
            Button(Icon("block"))
                .setStyle(ButtonStyle.Inline)
                .setColor(Color.Colored)
                .addClass("tag")
                .onPromiseClick(async () => {
                    const form = new FormData();
                    form.set("type", "REVIEW_DECLINED");
                    await API.music(API.getToken()).id(x._id).put(form);
                    await loadSongs(view, imageCache);
                })
        ),
        CenterV(
            Button(Icon("task_alt"))
                .setStyle(ButtonStyle.Inline)
                .setColor(Color.Colored)
                .addClass("tag")
                .onPromiseClick(async () => {
                    const form = new FormData();
                    form.set("type", "PUBLISHED");
                    await API.music(API.getToken()).id(x._id).put(form);
                    await loadSongs(view, imageCache);
                })
        )
    ] : [];
}
