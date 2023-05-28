import { Box, Entry } from "webgen/mod.ts";
import { ProfileData, showProfilePicture } from "../../manager/helper.ts";

export function UserEntry(x: ProfileData) {
    return Entry({
        title: x.profile.username,
        subtitle: `${x._id} - ${x.profile.email}`
    })
        .addClass("limited-width", "small")
        .addPrefix(Box(showProfilePicture(x)));
}