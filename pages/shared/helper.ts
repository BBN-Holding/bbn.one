import { fail } from "@std/assert/fail";
import { LruCache, memoize } from "@std/cache";
import { API, fileCache, Permission, stupidErrorAlert } from "shared/mod.ts";
import { asRef, asRefRecord, Async, Component, DropDown, Empty, Grid, Image, ImageComponent, PrimaryButton, SheetHeader, Sheets, Spinner, WriteSignal } from "webgen/mod.ts";
import { loginRequired } from "../../components/pages.ts";
import { Drop, Song } from "../../spec/music.ts";

// @deno-types="https://raw.githubusercontent.com/lucsoft-DevTeam/lucsoft.de/master/custom.d.ts"
import spotify from "../music-landing/assets/spotify.svg";
// @deno-types="https://raw.githubusercontent.com/lucsoft-DevTeam/lucsoft.de/master/custom.d.ts"
import deezer from "../music-landing/assets/deezer.svg";
// @deno-types="https://raw.githubusercontent.com/lucsoft-DevTeam/lucsoft.de/master/custom.d.ts"
import tidal from "../music-landing/assets/tidal.svg";
// @deno-types="https://raw.githubusercontent.com/lucsoft-DevTeam/lucsoft.de/master/custom.d.ts"
import apple from "../music-landing/assets/apple.svg";

export const allowedAudioFormats = ["audio/flac", "audio/wav", "audio/mp3"];
export const allowedImageFormats = ["image/png", "image/jpeg"];

export type ProfileData = {
    _id: string;
    profile: {
        email: string;
        verified?: {
            email?: boolean;
        };
        username: string;
        avatar?: string;
    };
    permissions: Permission[];
    groups: string[];
};

export function IsLoggedIn(): ProfileData | null {
    try {
        return localStorage["access-token"] ? JSON.parse(b64DecodeUnicode(localStorage["access-token"].split(".")[1])).user : null;
    } catch (_) {
        // Invalid state. We gonna need to say goodbye to that session
        resetTokens();
        return null;
    }
}

export function getSecondary(secondary: Record<string, string[]>, primaryGenre?: string) {
    return primaryGenre ? secondary[primaryGenre] : null;
}

function b64DecodeUnicode(value: string) {
    // Going backwards: from bytestream, to percent-encoding, to original string.
    return decodeURIComponent(atob(value).split("").map((c) => `%${(`00${c.charCodeAt(0).toString(16)}`).slice(-2)}`).join(""));
}
function rawAccessToken() {
    return JSON.parse(b64DecodeUnicode(localStorage["access-token"].split(".")[1]));
}

export const activeUser = asRefRecord({
    emailVerified: <boolean | undefined> undefined,
    email: <string | undefined> undefined,
    username: <string> "--",
    avatar: <string | undefined> undefined,
    permission: <Permission[]> [],
    id: <string | undefined> undefined,
});

export function permCheck(...per: Permission[]) {
    return API.isPermited(per, activeUser.permission.value);
}

export function updateActiveUserData() {
    try {
        const user = IsLoggedIn();
        if (!user) return;
        activeUser.emailVerified.setValue(user.profile.verified?.email);
        activeUser.username.setValue(user.profile.username);
        activeUser.email.setValue(user.profile.email);
        activeUser.avatar.setValue(user.profile.avatar);
        activeUser.id.setValue(user._id);
        activeUser.permission.setValue(user.permissions);
    } catch (_) {
        // Session should be invalid
        logOut();
    }
}

function checkIfRefreshTokenIsValid() {
    const token = localStorage["refresh-token"];
    if (!token) return;
    const tokenData = JSON.parse(b64DecodeUnicode(token.split(".")[1]));
    if (isExpired(tokenData.exp)) {
        logOut();
        return;
    }
}
export function logOut(goal?: string) {
    if (location.pathname.startsWith("/signin")) return;
    resetTokens();
    location.href = "/signin";
    localStorage.goal = goal ?? "/c/music";
}

export function resetTokens() {
    localStorage.removeItem("refresh-token");
    localStorage.removeItem("access-token");
    localStorage.removeItem("goal");
}

export function gotoGoal() {
    location.href = localStorage.goal || "/c/music";
}

export async function renewAccessTokenIfNeeded() {
    if (!localStorage.getItem("access-token")) return;
    const { exp } = rawAccessToken();
    if (!exp) return logOut();
    // We should renew the token 30s before it expires
    if (isExpired(exp)) {
        await forceRefreshToken();
    }
}

export const tokens = asRefRecord({
    accessToken: localStorage["access-token"],
    refreshToken: localStorage["refresh-token"],
});

export async function forceRefreshToken() {
    try {
        const access = await API.auth.refreshAccessToken.post(localStorage["refresh-token"]).then(stupidErrorAlert);
        localStorage["access-token"] = access.token;
        tokens.accessToken.setValue(access.token);
    } catch (_) {
        // TODO: Make a better offline support
        location.href = "/";
    }
}

function isExpired(exp: number) {
    return exp * 1000 < new Date().getTime() + (0.5 * 60 * 1000);
}

export async function RegisterAuthRefresh() {
    if (!IsLoggedIn()) return shouldLoginPage();
    try {
        updateActiveUserData();
        checkIfRefreshTokenIsValid();
        await renewAccessTokenIfNeeded();
        setInterval(() => renewAccessTokenIfNeeded(), 1000);
    } catch (error) {
        console.error(error);
    }
}

function shouldLoginPage() {
    if (!loginRequired.find((x) => location.pathname.startsWith(x))) {
        return;
    }
    localStorage.goal = location.pathname + location.search;
    location.href = "/signin";
    throw "aborting javascript here";
}

export const sheetStack = Sheets();

sheetStack
    .setMinWidth("auto")
    .setWidth("auto");

export function getYearList(): string[] {
    return new Array(new Date().getFullYear() - 2000 + 1)
        .fill(1)
        .map((_, i) => (new Date().getFullYear()) - i)
        .map((x) => x.toString());
}

export function saveBlob(blob: Blob, fileName: string) {
    const a = document.createElement("a");
    const url = globalThis.URL.createObjectURL(blob);
    a.href = url;
    a.download = fileName;
    a.click();
    globalThis.URL.revokeObjectURL(url);
}

export function showPreviewImage(x: Drop) {
    return Empty();
    // return x.artwork ? Cache(`image-preview-${x.artwork}`, () => Promise.resolve(), (type) => type == "loaded" ? Image({ type: "direct", source: () => loadImage(x) }, "A Song Artwork") : Box()) : Image(templateArtwork, "A Placeholder Artwork.");
}

async function loadImage(x: Drop) {
    const cache = await fileCache();
    if (await cache.has(`image-preview-${x.artwork}`)) {
        return await cache.get(`image-preview-${x.artwork}`)!;
    }
    const blob = await API.music.id(x._id).artwork().then(stupidErrorAlert);
    await cache.set(`image-preview-${x.artwork}`, blob);
    return blob;
}

export function stringToColor(str: string) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    let color = "#";
    for (let i = 0; i < 3; i++) {
        const value = (hash >> (i * 8)) & 0xFF;
        color += (`00${value.toString(16)}`).slice(-2);
    }
    return color;
}

export function ProfilePicture(component: Component, name: string) {
    const ele = component.draw();
    ele.style.backgroundColor = stringToColor(name);
    return Grid({
        draw: () => ele,
    })
        .setCssStyle("overflow", "hidden")
        .setRadius("mid");
}

export function getNameInital(name: string) {
    if (name.includes(", ")) {
        return name.split(", ").map((x) => x.at(0)?.toUpperCase()).join("");
    }
    if (name.includes(",")) {
        return name.split(",").map((x) => x.at(0)?.toUpperCase()).join("");
    }
    if (name.includes(" ")) {
        return name.split(" ").map((x) => x.at(0)?.toUpperCase()).join("");
    }
    return name.at(0)!.toUpperCase();
}

const cache = new LruCache<unknown, Promise<Blob>>(10);

const getPicture = memoize(async (id: string) => {
    const image = await API.user.picture(id);
    if (image.status == "fulfilled") {
        return image.value;
    }
    fail("Failed to load image");
}, { cache });

export function showProfilePicture(x: ProfileData) {
    return ProfilePicture(
        Async(
            (async () => {
                const image = await getPicture(x._id);
                return Image(URL.createObjectURL(image), "Profile picture");
            })(),
            Spinner(),
        ),
        x.profile.username,
    );
}

export const streamingImages: Record<string, ImageComponent> = {
    spotify: Image(spotify, "Spotify").draw(),
    deezer: Image(deezer, "Deezer").draw(),
    tidal: Image(tidal, "Tidal").draw(),
    apple: Image(apple, "Apple Music").draw(),
};

export const ExistingSongDialog = (dropSongs: WriteSignal<Song[]>, songs: Song[]) => {
    const selected = asRef(undefined);
    return Grid(
        SheetHeader("Add Existing Song", sheetStack),
        DropDown(songs.map((x) => x._id), selected, "Select Song").setValueRender((x) => songs.find((y) => y._id == x)?.title ?? "Unknown"),
        PrimaryButton("Add").setMargin("1rem 0 0 0").onClick(() => {
            const selectedSong = selected.getValue();
            if (selectedSong) {
                dropSongs.push(selectedSong);
            }
            sheetStack.removeOne();
            selected.setValue(undefined);
        }),
    );
};

export function randomInteger(lower: number, upper: number): number {
    return lower + Math.floor(Math.random() * (upper - lower + 1));
}
