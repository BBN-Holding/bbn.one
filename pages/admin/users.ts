import { Horizontal, PlainText, Spacer, Vertical, Component, MediaQuery } from "webgen/mod.ts";
import { ProfileData } from "../manager/helper.ts";
import { showProfilePicture } from "./helper.ts";
import { state } from "./state.ts";

export function UserPanel(): Component {
    return Vertical(
        (state.users?.filter(user => JSON.stringify(user).includes(state.usersearch ?? ''))) ? [
            PlainText("Users")
                .addClass("list-title")
                .addClass("limited-width"),
            Vertical(state.users!.map(x => RenderEntry(x))).setGap("1rem"),
        ] : [
            PlainText("No Users")
                .addClass("list-title")
                .addClass("limited-width"),
            PlainText("All done! You are now allowed to lean back and relax. 🧋")
                .addClass("limited-width"),
        ],
    )
        .setGap("1rem");
}

function RenderEntry(x: ProfileData) {
    return MediaQuery("(max-width: 880px)", (small) => small ? Vertical(
        Horizontal(
            showProfilePicture(x).addClass("small-preview"),
            Vertical(
                PlainText(x.profile.username ?? "(no text)")
                    .setMargin("-0.4rem 0 0")
                    .setFont(2, 700),
                PlainText(x._id + " - " + x.profile.email),
            ),
            Spacer()
        )
    ).setPadding("0.5rem")
        .setGap("0.8rem")
        .addClass("list-entry")
        .addClass("limited-width")
        :
        Horizontal(
            showProfilePicture(x).addClass("small-preview"),
            Vertical(
                PlainText(x.profile.username ?? "(no text)")
                    .setMargin("-0.4rem 0 0")
                    .setFont(2, 700),
                PlainText(x._id + " - " + x.profile.email)
            ),
            Spacer()
        )
            .setPadding("0.5rem")
            .addClass("list-entry")
            .addClass("limited-width")
    );
}