import { Box, Entry, Image, PlainText, ReCache } from "webgen/mod.ts";
import { ProfileData, ProfilePicture, getNameInital } from "../../manager/helper.ts";

export function UserEntry(x: ProfileData) {
    return Entry({
        title: x.profile.username,
        subtitle: `${x._id} - ${x.profile.email}`
    })
        .addClass("limited-width", "small")
        .addPrefix(ReCache("user-preview-" + x._id, () => Promise.resolve(), (type) => {
            const imageSource = type == "loaded" && x.profile.avatar
                ? Image(x.profile.avatar, "User Image")
                : ProfilePicture(PlainText(getNameInital(x.profile.username)), x.profile.username);

            return Box(imageSource)
                .addClass("image-square");
        }));
}