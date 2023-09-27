// This code Will be ported to webgen

import { API, fileCache, Permission, stupidErrorAlert } from "shared";
import { asPointer, Box, Button, Cache, Component, Custom, Dialog, DropDownInput, Horizontal, Image, Label, Page, Spacer, State, StateHandler, Style, SupportedThemes, Table, TextInput, Vertical } from "webgen/mod.ts";
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
        provider: "google" | "discord" | "microsoft" | string,
        id: string;
    };
    profile: {
        email: string;
        verified?: {
            email?: boolean,
        },
        username: string;
        avatar?: string;
    };
    permissions: Permission[];
    groups: string[];
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

export function changeThemeColor(): ((data: SupportedThemes, options: Style) => void) | undefined {
    return (_data) => { };// document.head.querySelector("meta[name=theme-color]")?.setAttribute("content", data == SupportedThemes.autoLight ? "#e6e6e6" : "#0a0a0a");
}

export function getSecondary(secondary: Record<string, string[]>, primaryGenre?: string): string[] | null {
    return primaryGenre ? secondary[ primaryGenre ] : null;
}

function b64DecodeUnicode(value: string) {
    // Going backwards: from bytestream, to percent-encoding, to original string.
    return decodeURIComponent(atob(value).split('').map((c) => `%${(`00${c.charCodeAt(0).toString(16)}`).slice(-2)}`).join(''));
}
function rawAccessToken() {
    return JSON.parse(b64DecodeUnicode(localStorage[ "access-token" ].split(".")[ 1 ]));
}

export const activeUser = State({
    email: <string | undefined>undefined,
    username: <string>"--",
    avatar: <string | undefined>undefined,
    permission: <Permission[]>[],
    id: <string | undefined>undefined
});

export const profile = {
    picture: (_id: string) => {
        const data = asPointer(null);
        return data.map(it => Image({ type: "loading" }, "Profile picture")).asRefComponent();
    },
    userName: (_id: string) => {
        const data = asPointer(null);
        return data.map(it => `(${_id})`);
    }
};

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
        activeUser.permission = State(user.permissions);
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
export function logOut(goal?: string) {
    if (location.pathname.startsWith("/signin")) return;
    resetTokens();
    location.href = "/signin";
    localStorage.goal = goal ?? "/music";
}

export function resetTokens() {
    localStorage.removeItem("refresh-token");
    localStorage.removeItem("access-token");
    localStorage.removeItem("goal");
}

export function gotoGoal() {
    location.href = localStorage.goal || "/music";
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

export const tokens = State({
    accessToken: localStorage[ "access-token" ],
    refreshToken: localStorage[ "refresh-token" ]
});
export async function forceRefreshToken() {
    try {
        const access = await API.auth.refreshAccessToken.post(localStorage[ "refresh-token" ]).then(stupidErrorAlert);
        localStorage[ "access-token" ] = access.token;
        tokens.accessToken = access.token;
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
    if (!loginRequired.find(x => location.pathname.startsWith(x))) {
        return;
    }
    localStorage.goal = location.pathname + location.search;
    location.href = "/signin";
    throw "aborting javascript here";
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
    let color = '#';
    for (let i = 0; i < 3; i++) {
        const value = (hash >> (i * 8)) & 0xFF;
        color += (`00${value.toString(16)}`).substring(-2);
    }
    return color;
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

const ARTIST_ARRAY = <ArtistTypes[]>[ "PRIMARY", "FEATURING", "PRODUCER", "SONGWRITER" ];
export function EditArtists(list: Artist[]) {
    const form = Page({
        list
    }, (state) => [
        state.$list.map(() =>
            Vertical(
                Table([
                    [ "Type", "10rem", (artist, index) =>
                        DropDownInput("Type", ARTIST_ARRAY)
                            .setValue(artist[ 2 ])
                            .onChange(data => update(state, index, 2, data))
                    ],
                    [ "Name", "auto", (artist, index) =>
                        TextInput("text", "Name", "blur")
                            .setValue(artist[ 0 ])
                            .onChange(data => update(state, index, 0, data!))
                    ]
                ], state.list)
                    .setDelete((_, i) => {
                        state.list = state.list?.filter((_, index) => index != i) as typeof state.list;
                    }),
                Horizontal(
                    Spacer(),
                    Button("Add Artist") // TODO: Remove this in the future => switch to ghost rows
                        .onClick(() => {
                            state.list = <any>[ ...state.list, [ "", "", ArtistTypes.Primary ] ];
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
export function showPreviewImage(x: Drop) {
    return x.artwork ? Cache(`image-preview-${x.artwork}`, () => Promise.resolve(),
        type => type == "loaded"
            ? Image({ type: "direct", source: () => loadImage(x) }, "A Song Artwork")
            : Box())
        : Image(artwork, "A Placeholder Artwork.");
}

export async function loadImage(x: Drop) {
    const cache = await fileCache();
    if (await cache.has(`image-preview-${x.artwork}`))
        return await cache.get(`image-preview-${x.artwork}`)!;
    const blob = await API.music.id(x._id).artwork().then(stupidErrorAlert);
    await cache.set(`image-preview-${x.artwork}`, blob);
    return blob;
}

function update(state: StateHandler<{ list: [ name: string, img: string, type: ArtistTypes ][] | undefined; }>, index: number, key: number, value: string) {
    if (!state.list)
        state.list = [];
    state.list[ index ][ key ] = value;
    state.list = [ ...state.list ];
}

export function getDropFromPages(data: StateHandler<any>[], restore?: Drop): Drop {
    return <Drop>{
        ...restore,
        ...Object.assign({}, ...data)
    };
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
        x.profile.avatar ? Image(x.profile.avatar!, "") : Label(getNameInital(x.profile.username)),
        x.profile.username
    );
}