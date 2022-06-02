// This code Will be proted to webgen

import { Box, Button, Card, Component, Custom, Dialog, DropDownInput, Grid, headless, Horizontal, Icon, Input, Page, PlainText, Spacer, Vertical, View } from "../../deps.ts";
import { ArtistTypes, Drop } from "./RESTSpec.ts";
import { ColumEntry } from "./types.ts";

export const allowedAudioFormats = [ "audio/flac", "audio/wav" ];
export const allowedImageFormats = [ "image/png", "image/jpeg" ];

export type ProfileData = {
    user: string;
    name: string;
    email: string;
    picture?: string;
};

export function GetCachedProfileData(): ProfileData {
    return JSON.parse(atob(localStorage[ "access-token" ].split(".")[ 1 ]));
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

export function Table<Data>(_columns: ColumEntry<Data>[], data: Data[]) {
    return Card(headless(
        Grid(
            Spacer(), // drag
            ..._columns.map(([ id ]) => PlainText(id.toString()).addClass("title")),
            Spacer(), // delete

            ...data.map((x): Component[] => [
                Icon("drag_indicator"),
                ..._columns.map(([ _id, _size, render ], index) => render(x, index)),
                Icon("delete")
            ]).flat(),
        )
            .setAlign("center")
            .setGap("5px 13px")
            .setWidth("100%")
            .setRawColumns(`24px ${_columns.map(([ _, data = "max-content" ]) => data).join(" ")} 24px`)
    )).addClass("wtable")
}

export function syncFromData(formData: FormData, key: string) {
    return {
        liveOn: (value: string) => formData.set(key, value),
        value: formData.get(key)?.toString(),
    }
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

export function UploadTable<Data>(_columns: ColumEntry<Data>[], upload: (list: { file: File, blob: Blob }[]) => void) {
    const table = Table(_columns, []).draw();
    table.ondragleave = (ev) => {
        ev.preventDefault();
        table.classList.remove("hover");
    }
    table.ondragover = (ev) => {
        ev.preventDefault();
        table.classList.add("hover");
    };
    table.ondrop = async (ev) => {
        ev.preventDefault();
        upload(await Promise.all(Array.from(ev.dataTransfer?.files ?? []).filter(x => allowedAudioFormats.includes(x.type)).map(async x => {
            const blob = new Blob([ await x.arrayBuffer() ], { type: x.type });
            return { file: x, blob };
        })));
    }
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
        formdefault.append("actor", id)
        formdefault.set(`actor-${id}-name`, name)
        formdefault.set(`actor-${id}-type`, type)
    });

    const form = Page((data) => [
        View(({ update }) =>
            Vertical(
                Table([
                    [ "Type", "10rem", ({ id }) => DropDownInput("Type", <ArtistTypes[]>[ "PRIMARY", "FEATURING", "PRODUCER", "SONGWRITER" ]).syncFormData(data, `actor-${id}-type`) ],
                    [ "Name", "auto", ({ id }) => Input({ placeholder: "Name", ...syncFromData(data, `actor-${id}-name`) }) ]
                ], data.getAll("actor").map((id) => {
                    return {
                        id: id as string,
                        Name: data.get(`actor-${id}-name`)!.toString(),
                        Type: data.get(`actor-${id}-type`)!.toString()
                    };
                })),
                Horizontal(
                    Spacer(),
                    Button("Add Artist") // TODO: Remove this in the future => switch to ghost rows
                        .onClick(() => {
                            const id = crypto.randomUUID();
                            data.append("actor", id)
                            data.set(`actor-${id}-name`, "")
                            data.set(`actor-${id}-type`, "PRIMARY")
                            update({})
                        })
                ).setPadding("0 0 3rem 0")
            )
                .setGap("var(--gap)")
                .setWidth("clamp(0rem, 100vw, 60vw)")
                .setMargin("0 -.6rem 0 0")
        ).asComponent()
    ])
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
                    ))

                return "remove";
            })
            .open()
    })
}