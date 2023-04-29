import { Component, Custom, PlainText, ReCache, Image, Box } from "webgen/mod.ts";
import { ProfileData, stringToColour } from "../manager/helper.ts";

export function ProfilePicture(component: Component, name: string) {
    const ele = component.draw();
    ele.style.backgroundColor = stringToColour(name);
    return Custom(ele).addClass("profile-picture");
}

export function getNameInital(raw: string) {
    const name = raw.trim();
    if (name.includes(", "))
        return name.split(", ").map(x => x.at(0)?.toUpperCase()).join("");
    if (name.includes(","))
        return name.split(",").map(x => x.at(0)?.toUpperCase()).join("");
    if (name.includes(" "))
        return name.split(" ").map(x => x.at(0)?.toUpperCase()).join("");
    return name.at(0)!.toUpperCase();
}

export function showProfilePicture(x: ProfileData) {
    return ProfilePicture(
        x.profile.avatar ?
            ReCache(x.profile.avatar, () => Promise.resolve(), (type) => type == "loaded" ? Image(x.profile.avatar!, "") : Box())
            : PlainText(getNameInital(x.profile.username)),
        x.profile.username
    ).setMargin("0 0.5rem 0 0");
}