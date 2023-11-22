import { Entry } from "webgen/mod.ts";
import { Group } from "../../../spec/music.ts";
import { ProfileData, showProfilePicture } from "../../_legacy/helper.ts";

export function UserEntry(x: ProfileData) {
    return Entry({
        title: x.profile.username,
        subtitle: `${x._id} - ${x.profile.email}`
    })
        .addClass("small")
        .addPrefix(showProfilePicture(x));
}

export function GroupEntry(x: Group) {
    return Entry({
        title: x.displayName,
        subtitle: `${x._id} - ${x.permission}`
    })
        .addClass("small");
}