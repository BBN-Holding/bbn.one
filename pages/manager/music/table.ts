import { Box, ButtonStyle, Checkbox, Color, createElement, Custom, DropDownInput, PlainText, Spacer } from "../../../deps.ts";
import { getYearList } from "../helper.ts";
import { ColumEntry } from "../types.ts";

import primary from "../../../data/primary.json" assert { type: "json"};
import language from "../../../data/language.json" assert { type: "json"};


export const TableDef = (formData: FormData) => <ColumEntry<{ Id: string }>[]>[
    [ "Title", "auto", ({ Id }) =>
        formData.has(`song-${Id}-progress`) ? Box(
            Custom((() => {
                const element = createElement("progress")
                element.max = 100;
                element.value = parseFloat(formData.get(`song-${Id}-progress`)?.toString() ?? "")
                return element;
            })())
        ) :
            PlainText(formData.get(`song-${Id}-progress`)?.toString() ?? formData.get(`song-${Id}-title`)?.toString() ?? "-").setFont(1, 500) ],
    [ "Artists", "max-content", () => Spacer() ],
    [ "Year", "max-content", ({ Id }) =>
        DropDownInput("Year", getYearList())
            .syncFormData(formData, `song-${Id}-year`)
            .setStyle(ButtonStyle.Inline)
    ],
    [ "Country", "max-content", ({ Id }) =>
        DropDownInput("Country", language)
            .syncFormData(formData, `song-${Id}-country`)
            .setStyle(ButtonStyle.Inline)
    ],
    [ "Primary Genre", "max-content", ({ Id }) =>
        DropDownInput("Primary Genre", primary)
            .syncFormData(formData, `song-${Id}-primaryGenre`)
            .setStyle(ButtonStyle.Inline)
    ],
    [ "Secondary Genre", "max-content", () =>
        DropDownInput("Secondary Genre", primary)
            .setStyle(ButtonStyle.Inline)
            .setColor(Color.Disabled)
    ],
    [ "Explicit", "max-content", ({ Id }) =>
        Checkbox(formData.get(`song-${Id}-explicit`) == "true")
            .onClick((_, value) => formData.set(`song-${Id}-explicit`, !value ? "true" : "false"))
    ],
];