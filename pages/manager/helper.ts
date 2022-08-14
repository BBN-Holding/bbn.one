// This code Will be ported to webgen

import { Box, Button, Card, Component, createElement, Custom, Dialog, DropDownInput, Grid, headless, Horizontal, Icon, Input, Page, PlainText, Spacer, Vertical, View, ViewClass } from "webgen/mod.ts";
import { DeleteFromForm } from "./data.ts";
import { API, ArtistTypes, Drop } from "./RESTSpec.ts";
import { ColumEntry } from "./types.ts";
import '../../assets/css/wtable.css';
export const allowedAudioFormats = [ "audio/flac", "audio/wav" ];
export const allowedImageFormats = [ "image/png", "image/jpeg" ];

export type ProfileData = {
    user: string;
    email_verified?: boolean;
    name: string;
    email: string;
    groups: {
        slug: string,
        permissions: string[];
    }[];
    logins?: {
        _id: string;
        first_login: Date;
        last_login: Date;
        ip: string;
        agent: string;
    }[];
    picture?: string;
    exp?: number;
};
export function IsLoggedIn(): ProfileData | null {
    return localStorage[ "access-token" ] ? JSON.parse(atob(localStorage[ "access-token" ]?.split(".")[ 1 ])) : null;
}

export function getSecondary(secondary: Record<string, string[]>, formData: FormData, key = "primaryGenre"): string[] | null {
    //@ts-ignore Yes
    return secondary[ formData.get(key)?.toString() ?? "" ];
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

/**
 * @deprecated
 */
export function GetCachedProfileData(): ProfileData {
    return JSON.parse(atob(localStorage[ "access-token" ].split(".")[ 1 ]));
}
export async function renewAccessTokenIfNeeded(exp?: number) {
    if (!exp) return Redirect();
    // We should renew the token 30s before it expires
    if (isExpired(exp)) {
        await forceRefreshToken();
    }

}
export async function forceRefreshToken() {
    try {
        const { accessToken } = await API.auth.refreshAccessToken.post({ refreshToken: localStorage[ "refresh-token" ] });
        localStorage[ "access-token" ] = accessToken;
        console.log("Refreshed token");
    } catch (_) {
        localStorage.clear();
        Redirect();
    }
}

export function isExpired(exp: number) {
    return exp * 1000 < new Date().getTime() + (0.5 * 60 * 1000);
}

export function RegisterAuthRefresh() {
    const { exp } = GetCachedProfileData();
    if (exp && isExpired(exp)) {
        localStorage.clear();
        Redirect();
        return;
    }
    renewAccessTokenIfNeeded(exp);
    setInterval(() => renewAccessTokenIfNeeded(GetCachedProfileData().exp), 1000);
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


export async function loadSongs(view: ViewClass<{
    list: Drop[];
    reviews: Drop[];
    type: Drop[ "type" ];
}>, imageCache: Map<string, string>) {
    const source = new Set([
        ...await (async () => {
            if (GetCachedProfileData().groups.find(x => x.permissions.includes("songs-review"))) {
                const list = await API.music(API.getToken()).reviews.get();
                view.viewOptions().update({ reviews: list });
                return list;
            }
            return [];
        })(),
        ...await (async () => {
            const list = await API.music(API.getToken()).list.get();
            if (list.find(x => x.type == "UNSUBMITTED"))
                view.viewOptions().update({ list, type: "UNSUBMITTED" });
            else
                view.viewOptions().update({ list });

            return list;
        })()
    ]);

    for (const iterator of source) {
        (async () => {
            if (!iterator.artwork?.trim()) return;
            const image = await API.music(API.getToken()).id(iterator._id).artwork();
            imageCache.set(iterator._id, URL.createObjectURL(image));
            view.viewOptions().update({});
        })();
    }
}