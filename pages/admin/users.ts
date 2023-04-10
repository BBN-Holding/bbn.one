import { Button, ButtonStyle, Color, Horizontal, PlainText, Spacer, Vertical, CenterV, Component, ViewClass, MediaQuery } from "webgen/mod.ts";
import { ProfileData } from "../manager/helper.ts";
import { ViewState } from "../admin/types.ts";
import { showPreviewImage } from "./helper.ts";

export function UserPanel(view: () => ViewClass<ViewState>, state: Partial<ViewState>): Component {
    return Vertical(
        (state.users?.filter(user => JSON.stringify(user).includes(state.usersearch ?? ''))) ? [
            PlainText("Users")
                .addClass("list-title")
                .addClass("limited-width"),
            Vertical(...state.users!.map(x => RenderEntry(x, view))).setGap("1rem"),
        ] : [
            PlainText("No Users")
                .addClass("list-title")
                .addClass("limited-width"),
            PlainText("All done! You are now allowed to lean back and relax. 🧋")
                .addClass("limited-width"),
        ],
    )
        .setGap("1rem")
        .setMargin("1rem 0");
}

function RenderEntry(x: ProfileData) {
    return MediaQuery("(max-width: 880px)", (small) => small ? Vertical(
        Horizontal(
            showPreviewImage(x).addClass("small-preview"),
            Vertical(
                PlainText(x.profile.username ?? "(no text)")
                    .setMargin("-0.4rem 0 0")
                    .setFont(2, 700),
                PlainText(x._id + " - " + x.profile.email),
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
        )
    ).setPadding("0.5rem")
        .setGap("0.8rem")
        .addClass("list-entry")
        .addClass("limited-width")
        :
        Horizontal(
            showPreviewImage(x).addClass("small-preview"),
            Vertical(
                PlainText(x.profile.username ?? "(no text)")
                    .setMargin("-0.4rem 0 0")
                    .setFont(2, 700),
                PlainText(x._id + " - " + x.profile.email)
            ),
            Spacer(),
            CenterV(
                Button("Edit")
                    .setStyle(ButtonStyle.Inline)
                    .setColor(Color.Colored)
                    .addClass("tag")
                    .onClick(() => location.href = "/admin/useredit?id=" + x._id)
            ),
        )
            .setPadding("0.5rem")
            .addClass("list-entry")
            .addClass("limited-width")
    );
}