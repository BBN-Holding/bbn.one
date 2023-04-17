import { Button, ButtonStyle, CenterV, Color, Horizontal, Icon, MediaQuery, PlainText, Spacer, Vertical } from "webgen/mod.ts";
import { Drop, DropType } from "../../../spec/music.ts";
import { API } from "../../manager/RESTSpec.ts";
import { showPreviewImage } from "../../manager/helper.ts";
import { ReviewDialog } from "../dialog.ts";
import { refreshState } from "../loading.ts";

/**
 * This should be just an Entry()
 * Problem currently is that Entry has not all the features yet
 *
 * @deprecated
 */
export function RenderEntry(x: Drop) {
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
            ReviewActions(x)
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
            ReviewActions(x)
        )
            .setPadding("0.5rem")
            .addClass("list-entry")
            .addClass("limited-width")
    );
}

function ReviewActions(x: Drop) {
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
                        ReviewDialog.onClose(() => refreshState());
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