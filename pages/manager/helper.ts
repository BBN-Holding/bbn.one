// This code Will be ported to webgen

import { Box, Button, ColumEntry, Component, Custom, Dialog, DropDownInput, Horizontal, img, Page, PlainText, Reactive, ReCache, Spacer, StateHandler, Table, TextInput, Vertical, ViewClass } from "webgen/mod.ts";
import { API, ArtistTypes, Drop } from "./RESTSpec.ts";
import artwork from "../../assets/img/template-artwork.png";
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
    events?: { type: "auth", date: number, ip: string, source?: { type: "browser", }; }[];
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

/**
 * @deprecated
 */
export function GetCachedProfileData(): ProfileData {
    try {
        return JSON.parse(b64DecodeUnicode(localStorage[ "access-token" ].split(".")[ 1 ])).user;
    } catch (_) {
        // Same invalid state. (This is all need for the new migration to the new HmSYS Tokens)
        localStorage.clear();
        throw new Error("Invalid State. Relogin is forced.");
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
export async function renewAccessTokenIfNeeded(exp?: number) {
    if (!exp) return;
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
        const { exp } = GetCachedProfileData();
        checkIfRefreshTokenIsValid();
        await renewAccessTokenIfNeeded(exp);
        setInterval(() => renewAccessTokenIfNeeded(GetCachedProfileData().exp), 1000);
    } catch (_) {
        localStorage.clear();
        location.href = "/signin";
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
export function EditArtists(list: [ name: string, img: string, type: ArtistTypes ][]) {
    const form = Page({
        list: list
    }, (state) => [
        Reactive(state, "list", () =>
            Vertical(
                Table([
                    [ "Type", "10rem", (_, index) =>
                        DropDownInput("Type", ARTIST_ARRAY)
                            .addClass("justify-content-space")
                            .setValue([ state.list[ index ][ 2 ], ARTIST_ARRAY.indexOf(state.list[ index ][ 2 ]) ])
                            .onChange((data) => update(state, index, 2, data?.[ 0 ]))
                    ],
                    [ "Name", "auto", (_, index) =>
                        TextInput("text", "Name", "blur")
                            .setValue(state.list[ index ][ 0 ])
                            .onChange((data) => update(state, index, 0, data))
                    ]

                ], state.list)
                    .setDelete((_, index) => {
                        list = list.filter((_, i) => i != index);
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
export function showPreviewImage(x: Drop) {
    return ReCache(x._id,
        () => loadImage(x),
        (type, data) => type == "cache"
            ? Custom(img(data || artwork))
            : Custom(img(data || artwork))
    );
}
export async function loadImage(x: Drop) {
    if (!x.artwork) return undefined;
    const image = await API.music(API.getToken()).id(x._id).artworkPreview();
    return URL.createObjectURL(image);
}
export async function loadSongs(view: ViewClass<{
    list: Drop[];
    reviews: Drop[];
    type: Drop[ "type" ];
}>) {
    if (API.permission.canReview(GetCachedProfileData().groups)) {
        const list = await API.music(API.getToken()).reviews.get();
        view.viewOptions().update({ reviews: list });
    }
    const list = await API.music(API.getToken()).list.get();
    // Only do it when its the first time
    if (view.viewOptions().state.list == undefined && list.find(x => x.type == "UNSUBMITTED"))
        view.viewOptions().update({ list, type: "UNSUBMITTED" });
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