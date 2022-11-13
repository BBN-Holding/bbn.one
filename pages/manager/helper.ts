// This code Will be ported to webgen

import { Box, Button, Card, Component, createElement, Custom, Dialog, DropDownInput, Grid, headless, Horizontal, Icon, img, Input, loadingWheel, Page, PlainText, Spacer, Vertical, View, ViewClass } from "webgen/mod.ts";
import { DeleteFromForm } from "./data.ts";
import { API, ArtistTypes, Drop } from "./RESTSpec.ts";
import { ColumEntry } from "./types.ts";
import '../../assets/css/wtable.css';
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

export function getSecondary(secondary: Record<string, string[]>, formData: FormData, key = "primaryGenre"): string[] | null {
    //@ts-ignore Yes
    return secondary[ formData.get(key)?.toString() ?? "" ];
}
export const GLOBAL_CACHE = new Map<string, {
    // deno-lint-ignore no-explicit-any
    data?: any,
    render: Component;
}>();
// TODO: Move this to WebGen
export function ReCache<Data>(cacheId: string, loader: () => Promise<Data>, render: (type: "cache" | "loaded", data: undefined | Data) => Component) {
    if (!GLOBAL_CACHE.has(cacheId)) {
        const shell = createElement("div");
        GLOBAL_CACHE.set(cacheId, {
            render: Custom(shell)
        });

        shell.append(render("cache", undefined).draw());
        loader()
            .then(x => render("loaded", x))
            .then(x => x.draw())
            .then(x => shell.children[ 0 ].replaceWith(x));
    }

    const data = GLOBAL_CACHE.get(cacheId)!;
    return Box(data.render);
}
export function MediaQuery(query: string, view: (matches: boolean) => Component) {
    const holder = createElement("div");
    holder.innerHTML = "";
    holder.style.display = "contents";
    holder.append(view(matchMedia(query).matches).draw());
    matchMedia(query).addEventListener("change", ({ matches }) => {
        holder.innerHTML = "";
        holder.append(view(matches).draw());
    }, { passive: true });
    return Custom(holder);
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
class TableComponent<Data> extends Component {
    hasDelete = false;
    #columns: ColumEntry<Data>[];
    #data: Data[];

    constructor(_columns: ColumEntry<Data>[], data: Data[]) {
        super();
        this.#columns = _columns;
        this.#data = data;
        this.refresh();
    }

    setDelete(action: (entry: Data) => void | Promise<void>) {
        this.#columns.push([ "", "max-content",
            (data) => Icon("delete").onClick(async () => {
                await action(data);
                this.refresh();
            })
        ]);
        this.refresh();
        return this;
    }

    refresh() {
        const data = Card(headless(
            Grid(
                ...this.#columns.map(([ id ]) => PlainText(id.toString()).addClass("title")),

                ...this.#data.map((x): Component[] => [
                    ...this.#columns.map(([ _id, _size, render ], index) => render(x, index))
                ]).flat(),
            )
                .setAlign("center")
                .setGap("5px 13px")
                .setWidth("100%")
                .setRawColumns(`${this.#columns.map(([ _, data = "max-content" ]) => data).join(" ")}`)
        )).addClass("wtable").draw();
        this.wrapper = data;
    }
}
export function Table<Data>(_columns: ColumEntry<Data>[], data: Data[]) {
    return new TableComponent(_columns, data);
}

export function syncFromData(formData: FormData, key: string) {
    return {
        liveOn: (value: string) => formData.set(key, value),
        value: formData.get(key)?.toString(),
    };
}

// BBN Stuff
export function getYearList(): string[] {
    return new Array(8)
        .fill(1)
        .map((_, i) => (new Date().getFullYear() + 2) - i)
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

export function EditArtists(list: NonNullable<Drop[ "artists" ]>) {
    const formdefault = new FormData();
    list.forEach(([ name, _img, type ]) => {
        const id = crypto.randomUUID();
        formdefault.append("actor", id);
        formdefault.set(`actor-${id}-name`, name);
        formdefault.set(`actor-${id}-type`, type);
    });

    const form = Page((data) => [
        View(({ update }) =>
            Vertical(
                Table([
                    [ "Type", "10rem", ({ id }) => DropDownInput("Type", <ArtistTypes[]>[ "PRIMARY", "FEATURING", "PRODUCER", "SONGWRITER" ]).addClass("justify-content-space").syncFormData(data, `actor-${id}-type`) ],
                    [ "Name", "auto", ({ id }) => Input({ placeholder: "Name", ...syncFromData(data, `actor-${id}-name`) }) ]
                ], data.getAll("actor").map((id) => {
                    return {
                        id: id as string,
                        Name: data.get(`actor-${id}-name`)!.toString(),
                        Type: data.get(`actor-${id}-type`)!.toString()
                    };
                })).setDelete(({ id }) => {
                    DeleteFromForm(data, "actor", (x) => x != id);
                    update({});
                }),
                Horizontal(
                    Spacer(),
                    Button("Add Artist") // TODO: Remove this in the future => switch to ghost rows
                        .onClick(() => {
                            const id = crypto.randomUUID();
                            data.append("actor", id);
                            data.set(`actor-${id}-name`, "");
                            data.set(`actor-${id}-type`, "PRIMARY");
                            update({});
                        })
                ).setPadding("0 0 3rem 0")
            )
                .setGap("var(--gap)")
                .setWidth("clamp(0rem, 100vw, 60vw)")
                .setMargin("0 -.6rem 0 0")
        ).asComponent()
    ]);
    return new Promise<Drop[ "artists" ]>((done) => {
        const dialog = Dialog(() => Box(...form.setDefaultValues(formdefault).getComponents()))
            .setTitle("Manage your Artists")
            .allowUserClose()
            .addClass("light-mode")
            .onClose(() => {
                dialog.remove();
            })
            .addButton("Save", () => {
                const data = form.getFormData();
                done(data.getAll("actor")
                    .map((i) =>
                        [ data.get(`actor-${i}-name`), "", data.get(`actor-${i}-type`) ] as
                        [ name: string, img: string, type: ArtistTypes ]
                    ));

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