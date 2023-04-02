// This code Will be ported to webgen

import { Box, Button, ColumEntry, Component, Custom, Dialog, DropDownInput, Horizontal, Image, Page, PlainText, Reactive, ReCache, Spacer, State, StateHandler, Table, TextInput, Vertical, ViewClass } from "webgen/mod.ts";
import { API } from "./RESTSpec.ts";
import artwork from "../../assets/img/template-artwork.png";
import { Artist, ArtistTypes, Drop, DropType } from "../../spec/music.ts";
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
        permissions: string[];
    };
    groups: string[];
    exp: number;
};

export function IsLoggedIn(): ProfileData | null {
    try {
        return localStorage[ "access-token" ] ? JSON.parse(b64DecodeUnicode(localStorage[ "access-token" ]?.split(".")[ 1 ])).user : null;
    } catch (_) {
        // Invalid state. We gonna need to say goodbye to that session
        localStorage.clear();
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

/**
 * @deprecated
 */
export function GetCachedProfileData(): ProfileData {
    try {
        return JSON.parse(b64DecodeUnicode(localStorage[ "access-token" ].split(".")[ 1 ])).user;
    } catch (_) {
        logOut();
        throw _;
    }
}

export const activeUser = State({
    email: <string | undefined>"--",
    username: <string | undefined>"--",
    avatar: <string | undefined>undefined
});


export function updateActiveUserData() {
    try {
        if (!localStorage.getItem("access-token")) return;
        const user = JSON.parse(b64DecodeUnicode(localStorage[ "access-token" ].split(".")[ 1 ])).user as ProfileData;
        activeUser.username = user.profile.username;
        activeUser.email = user.profile.email;
        activeUser.avatar = user.profile.avatar;
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
        localStorage.clear();
        Redirect();
        return;
    }
}
export function logOut() {
    if (location.pathname.startsWith("/signin")) return;
    localStorage.clear();
    location.href = "/signin";
}
export async function renewAccessTokenIfNeeded() {
    const { exp } = rawAccessToken();
    if (!localStorage.getItem("type")) return;
    if (!exp) return logOut();
    // We should renew the token 30s before it expires
    if (isExpired(exp)) {
        await forceRefreshToken();
    }

}
export async function forceRefreshToken() {
    try {
        const access = await API.auth.refreshAccessToken.post({ refreshToken: localStorage[ "refresh-token" ] });
        localStorage[ "access-token" ] = access.token;
        console.log("Refreshed token");
    } catch (_) {
        // TODO: Make a better offline support
        location.href = "/";
    }
}

export function isExpired(exp: number) {
    return exp * 1000 < new Date().getTime() + (0.5 * 60 * 1000);
}

export async function RegisterAuthRefresh() {
    try {
        updateActiveUserData();
        checkIfRefreshTokenIsValid();
        await renewAccessTokenIfNeeded();
        setInterval(() => renewAccessTokenIfNeeded(), 1000);
    } catch (_) {
        console.error(_);
    }
}
export function Redirect() {
    if (localStorage[ "refresh-token" ] && location.href.includes("/signin"))
        location.href = "/music"; // TODO do this better
    else if (!localStorage[ "refresh-token" ] && !location.href.includes("/signin"))
        location.href = "/signin";
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

export function stringToColour(str: string) {
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
        PlainText("Nothing here yet").addClass("droptitle"),
        PlainText("Drag & Drop your Files here").addClass("dropsubtitle")
    ).setGap("2.5rem").addClass("drop-area-label").draw());
    return Custom(table);
}
const ARTIST_ARRAY = <ArtistTypes[]>[ "PRIMARY", "FEATURING", "PRODUCER", "SONGWRITER" ];
export function EditArtists(list: Artist[]) {
    const form = Page({
        list: list
    }, (state) => [
        Reactive(state, "list", () =>
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
                            // deno-lint-ignore no-explicit-any
                            state.list = <any>[ ...state.list, [ "", "", "PRIMARY" ] ];
                        })
                ).setPadding("0 0 3rem 0")
            )
                .setGap("var(--gap)")
                .setWidth("clamp(0rem, 100vw, 60vw)")
                .setMargin("0 -.6rem 0 0")
        )
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
    return ReCache("image-preview-" + x._id + big, () => Promise.resolve(), (type) => type == "loaded" && x.artwork ? Image({ type: "direct", source: async () => await loadImage(x) ?? artwork }, "A Song Artwork") : Image(artwork, "A Placeholder Artwork.")).addClass("image-preview");
}

export async function loadImage(x: Drop) {
    if (!x.artwork) return undefined;
    return await API.music(API.getToken()).id(x._id).artworkPreview();
}
export async function loadSongs(view: ViewClass<{
    list: Drop[];
    reviews: Drop[];
    type: Drop[ "type" ];
}>) {
    if (API.permission.canReview(IsLoggedIn() ? IsLoggedIn()!.groups : [])) {
        const list = await API.music(API.getToken()).reviews.get();
        view.viewOptions().update({ reviews: list });
    }
    const list = await API.music(API.getToken()).list.get();
    // Only do it when its the first time
    if (view.viewOptions().state.list == undefined && list.find(x => x.type == "UNSUBMITTED"))
        view.viewOptions().update({ list, type: DropType.Unsubmitted });
    else
        view.viewOptions().update({ list });
}

// deno-lint-ignore no-explicit-any
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
        ...data
    };
}
