import { Entry } from "webgen/mod.ts";
import { Group } from "../../../spec/music.ts";
import { ProfileData, showProfilePicture } from "../../_legacy/helper.ts";

export function GroupEntry(x: Group) {
    return Entry({
        title: x.displayName,
        subtitle: `${x._id} - ${x.permission}`
    })
        .addClass("small");
}