import { PlainText, Vertical, Component } from "webgen/mod.ts";
import { state } from "./state.ts";
import { UserEntry } from "./views/entryUser.ts";

export function UserPanel(): Component {
    return Vertical(
        (state.users?.filter(user => JSON.stringify(user).includes(state.usersearch ?? ''))) ? [
            PlainText("Users")
                .addClass("list-title")
                .addClass("limited-width"),
            Vertical(state.users!.map(x => UserEntry(x))).setGap("1rem"),
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