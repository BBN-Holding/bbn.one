// This code Will be proted to webgen

import { Card, Component, createElement, Custom, Grid, headless, Horizontal, Icon, PlainText, Spacer, Vertical } from "../../deps.ts";
import { ColumEntry } from "./types.ts";

export const allowedAudioFormats = [ "audio/flac", "audio/wav" ];
export const allowedImageFormats = [ "image/png", "image/jpeg" ];

export function Center(text: Component) {
    return Horizontal(
        Spacer(),
        text,
        Spacer()
    )
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
            .setRawColumns(`24px ${_columns.map(([ _, data = "max-content" ]) => data).join(" ")} 24px`)
    )).addClass("wtable")
}

export function DropAreaInput(text: string, replacement?: Component, onData?: (blob: Blob, url: string) => void) {
    const shell = createElement("div");
    shell.ondragleave = (ev) => {
        ev.preventDefault();
        shell.classList.remove("hover");
    }
    shell.ondragover = (ev) => {
        ev.preventDefault();
        shell.classList.add("hover");
    };
    shell.ondrop = async (ev) => {
        ev.preventDefault();
        const file = ev.dataTransfer?.files[ 0 ];
        if (!file) return;
        if (!allowedImageFormats.includes(file.type)) return alert("Only png and jpeg is supported");
        const blob = new Blob([ await file.arrayBuffer() ], { type: file.type });
        onData?.(blob, URL.createObjectURL(blob));
    }
    shell.classList.add("drop-area");
    if (replacement)
        shell.append(replacement.draw())
    else
        shell.append(PlainText(text).draw())
    return Custom(shell);
}

// BBN Stuff
export function getYearList(): string[] {
    return new Array(8)
        .fill(1)
        .map((_, i) => (new Date().getFullYear() + 2) - i)
        .map((x) => x.toString());
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
