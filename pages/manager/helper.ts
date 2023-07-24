// deno-lint-ignore-file no-explicit-any
// This code Will be ported to webgen

import { API, fileCache, Permission } from "shared";
import { Box, Button, Cache, ColumEntry, Component, Custom, Dialog, DropDownInput, Horizontal, Image, Label, Page, Spacer, State, StateHandler, Table, TextInput, Vertical } from "webgen/mod.ts";
import artwork from "../../assets/img/template-artwork.png";
import { loginRequired } from "../../components/pages.ts";
import { Artist, ArtistTypes, Drop } from "../../spec/music.ts";
export const allowedAudioFormats = [ "audio/flac", "audio/wav", "audio/mp3" ];
export const allowedImageFormats = [ "image/png", "image/jpeg" ];

export type ProfileData = {
    _id: string;
    authentication?: {
        type: "password";
        salt: string;
        hash: string;
    } | {
        type: "oauth",
        provider: "google" | "apple" | "github" | "microsoft" | string,
        secret: string;
    };
    profile: {
        email: string;
        verified?: {
            email?: boolean,
        },
        calledAfter?: string;
        username: string;
        avatar?: string;
        created: number;
    };
    permissions: string[];
    groups: string[];
    exp: number;
};

export function IsLoggedIn(): ProfileData | null {
    try {
        return localStorage[ "access-token" ] ? JSON.parse(b64DecodeUnicode(localStorage[ "access-token" ]?.split(".")[ 1 ])).user : null;
    } catch (_) {
        // Invalid state. We gonna need to say goodbye to that session
        resetTokens();
        return null;
    }
}

export function getSecondary(secondary: Record<string, string[]>, primaryGenre?: string): string[] | null {
    return primaryGenre ? secondary[ primaryGenre ] : null;
}

function b64DecodeUnicode(value: string) {
    // Going backwards: from bytestream, to percent-encoding, to original string.
    return decodeURIComponent(atob(value).split('').map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
}
function rawAccessToken() {
    return JSON.parse(b64DecodeUnicode(localStorage[ "access-token" ].split(".")[ 1 ]));
}

export const activeUser = State({
    email: <string | undefined>"--",
    username: <string>"--",
    avatar: <string | undefined>undefined,
    permission: <Permission[]>[],
    id: <string | undefined>undefined
});

export function permCheck(...per: Permission[]) {
    return API.isPermited(per, activeUser.permission);
}

export function updateActiveUserData() {
    try {
        const user = IsLoggedIn();
        if (!user) return;
        activeUser.username = user.profile.username;
        activeUser.email = user.profile.email;
        activeUser.avatar = user.profile.avatar;
        activeUser.id = user._id;

        // Convert id based system to new hmsys permission system.
        activeUser.permission = State([
            ...activeUser.permission,
            ...new Set(user.groups.map(x => API._legacyPermissionFromGroups(x)).flat())
        ] as Permission[]);
        console.log("Current User", JSON.parse(JSON.stringify(activeUser)));
    } catch (_) {
        // Session should be invalid
        logOut();
    }
}

function checkIfRefreshTokenIsValid() {
    const token = localStorage[ "refresh-token" ];
    if (!token) return;
    const tokenData = JSON.parse(b64DecodeUnicode(token.split(".")[ 1 ]));
    if (isExpired(tokenData.exp)) {
        logOut();
        return;
    }
}
export function logOut() {
    if (location.pathname.startsWith("/signin")) return;
    resetTokens();
    location.href = "/signin";
    // default location
    localStorage.goal = "/music";
}

export function resetTokens() {
    localStorage.removeItem("refresh-token");
    localStorage.removeItem("access-token");
    localStorage.removeItem("type");
    localStorage.removeItem("goal");
}

export function gotoGoal() {
    location.href = localStorage.goal || "/music";
}
export async function renewAccessTokenIfNeeded() {
    if (!localStorage.getItem("type")) return;
    const { exp } = rawAccessToken();
    if (!exp) return logOut();
    // We should renew the token 30s before it expires
    if (isExpired(exp)) {
        await forceRefreshToken();
    }

}

export const tokens = State({
    accessToken: localStorage[ "access-token" ],
    refreshToken: localStorage[ "refresh-token" ]
});
export async function forceRefreshToken() {
    try {
        const access = await API.auth.refreshAccessToken.post(localStorage[ "refresh-token" ]);
        localStorage[ "access-token" ] = access.token;
        tokens.accessToken = access.token;
        console.log("Refreshed token");
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
    } catch (_) {
        console.error(_);
    }
}

export function shouldLoginPage() {
    if (loginRequired.find(x => location.pathname.startsWith(x))) {
        localStorage.goal = location.pathname + location.search;
        location.href = "/signin";
        throw "aborting javascript here";
    }
}

export function CenterAndRight(center: Component, right: Component): Component {
    return Horizontal(
        Spacer(),
        Spacer(),
        Vertical(
            Spacer(),
            center,
            Spacer()
        ),
        Spacer(),
        right
    );
}

// BBN Stuff
export function getYearList(): string[] {
    return new Array(new Date().getFullYear() - 2000 + 1)
        .fill(1)
        .map((_, i) => (new Date().getFullYear()) - i)
        .map((x) => x.toString());
}

export function stringToColor(str: string) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    let colour = '#';
    for (let i = 0; i < 3; i++) {
        const value = (hash >> (i * 8)) & 0xFF;
        colour += ('00' + value.toString(16)).substr(-2);
    }
    return colour;
}

const a = document.createElement('a');
document.body.appendChild(a);
a.setAttribute('style', 'display: none');

export function saveBlob(blob: Blob, fileName: string) {
    const url = window.URL.createObjectURL(blob);
    a.href = url;
    a.download = fileName;
    a.click();
    window.URL.revokeObjectURL(url);
}


export function UploadTable<Data>(_columns: ColumEntry<Data>[], upload: (list: File[]) => void) {
    const table = Table(_columns, []).draw();
    table.ondragleave = (ev) => {
        ev.preventDefault();
        table.classList.remove("hover");
    };
    table.ondragover = (ev) => {
        ev.preventDefault();
        table.classList.add("hover");
    };
    table.ondrop = (ev) => {
        ev.preventDefault();
        upload(Array.from(ev.dataTransfer?.files ?? []).filter(x => allowedAudioFormats.includes(x.type)));
    };
    table.append(Vertical(
        Label("Nothing here yet").addClass("droptitle"),
        Label("Drag & Drop your Files here").addClass("dropsubtitle")
    ).setGap("2.5rem").addClass("drop-area-label").draw());
    return Custom(table);
}
const ARTIST_ARRAY = <ArtistTypes[]>[ "PRIMARY", "FEATURING", "PRODUCER", "SONGWRITER" ];
export function EditArtists(list: Artist[]) {
    const form = Page({
        list: list
    }, (state) => [
        state.$list.map(() =>
            Vertical(
                Table([
                    [ "Type", "10rem", (_, index) =>
                        DropDownInput("Type", ARTIST_ARRAY)
                            .setValue(state.list[ index ][ 2 ])
                            .onChange((data) => update(state, index, 2, data))
                    ],
                    [ "Name", "auto", (_, index) =>
                        TextInput("text", "Name", "blur")
                            .setValue(state.list[ index ][ 0 ])
                            .onChange((data) => update(state, index, 0, data))
                    ]

                ], state.list)
                    .setDelete((_, index) => {
                        state.list = <typeof state.list>state.list.filter((_, i) => i != index);
                    }),
                Horizontal(
                    Spacer(),
                    Button("Add Artist") // TODO: Remove this in the future => switch to ghost rows
                        .onClick(() => {
                            state.list = <any>[ ...state.list, [ "", "", "PRIMARY" ] ];
                        })
                ).setPadding("0 0 3rem 0")
            )
                .setGap("var(--gap)")
                .setWidth("clamp(0rem, 100vw, 60vw)")
                .setMargin("0 -.6rem 0 0")
        ).asRefComponent()
    ]);
    return new Promise<Drop[ "artists" ]>((done) => {
        const dialog = Dialog(() => Box(...form.getComponents()))
            .setTitle("Manage your Artists")
            .allowUserClose()
            .addClass("light-mode")
            .onClose(() => {
                dialog.remove();
            })
            .addButton("Save", () => {
                const data = form.getFormData();
                done(data.list);

                return "remove";
            })
            .open();
    });
}
export function showPreviewImage(x: Drop, big = false) {
    return Cache("image-preview-" + x._id + big, () => Promise.resolve(),
        (type) => type == "loaded" && x.artwork
            ? Image({ type: "direct", source: () => loadImage(x) }, "A Song Artwork")
            : Image(artwork, "A Placeholder Artwork.")).addClass("image-preview");
}

export async function loadImage(x: Drop) {
    const cache = await fileCache();
    if (await cache.has(x._id + x.artwork))
        return cache.get(x._id + x.artwork);

    if (!x.artwork) return fetch(artwork).then(x => x.blob());
    const blob = await API.music(API.getToken()).id(x._id).artworkPreview();
    await cache.set(x._id + x.artwork, blob);
    return blob;
}

function update(state: StateHandler<{ list: [ name: string, img: string, type: ArtistTypes ][] | undefined; }>, index: number, key: number, value: any) {
    if (!state.list)
        state.list = [];
    // @ts-ignore errors due to any usage.
    state.list[ index ][ key ] = value;
    state.list = [ ...state.list ];
}

export function getDropFromPages(data: StateHandler<any>[], restore?: Drop): Drop {
    return <Drop>{
        ...restore,
        ...Object.assign({}, ...data)
    };
}

declare global {
    interface Window {
        dataLayer: any[];
    }
}

export function track(data: any) {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(data);
    console.log(window.dataLayer);
}

export function ProfilePicture(component: Component, name: string) {
    const ele = component.draw();
    ele.style.backgroundColor = stringToColor(name);
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
            Cache(x.profile.avatar, () => Promise.resolve(), (type) => type == "loaded" ? Image(x.profile.avatar!, "") : Box()) : Label(getNameInital(x.profile.username)),
        x.profile.username
    ).addClass("profile-picture");
}