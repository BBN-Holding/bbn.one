import { ViewClass, Component, Custom, PlainText, ReCache, Image, Box } from "webgen/mod.ts";
import { API } from "../manager/RESTSpec.ts";
import { IsLoggedIn, ProfileData, stringToColour } from "../manager/helper.ts";
import { ViewState } from "./types.ts";

export async function loadReviews(view: ViewClass<ViewState>) {
    if (API.permission.isReviewer(IsLoggedIn())) {
        const list = await API.music(API.getToken()).reviews.get();
        view.viewOptions().update({ reviews: list });
    }
}

export async function loadUsers(view: ViewClass<ViewState>) {
    if (API.permission.isAdmin(IsLoggedIn())) {
        const list = await API.user(API.getToken()).list.get();
        view.viewOptions().update({ users: list });
    }
}

export async function loadPayouts(view: ViewClass<ViewState>) {
    if (API.permission.isAdmin(IsLoggedIn())) {
        const list = await API.music(API.getToken()).payouts.get();
        view.viewOptions().update({ payouts: list });
    }
}

function ProfilePicture(component: Component, name: string) {
    const ele = component.draw();
    ele.style.backgroundColor = stringToColour(name);
    return Custom(ele).addClass("profile-picture");
}

function getNameInital(raw: string) {
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