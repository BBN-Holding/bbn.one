import { Box, ButtonStyle, Checkbox, Color, Component, createElement, Custom, Dialog, DropDownInput, IconButton, img, Input, PlainText, View } from "../../../deps.ts";
import { EditArtists, getYearList, stringToColour, syncFromData } from "../helper.ts";
import { ColumEntry } from "../types.ts";

import primary from "../../../data/primary.json" assert { type: "json"};
import language from "../../../data/language.json" assert { type: "json"};
function ProfilePicture(component: Component, name: string) {
    const ele = component.draw()
    ele.style.backgroundColor = stringToColour(name);
    return Custom(ele).addClass("profile-picture")
}

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
            // TODO: Refactor this to InlineTextInput() and add a custom size
            View(({ update }) =>
                PlainText(formData.get(`song-${Id}-title`)?.toString() ?? "-").setFont(1, 500)
                    .onClick(() => {
                        Dialog(() => Input({
                            placeholder: "title",
                            ...syncFromData(formData, `song-${Id}-title`),
                        }))
                            .onClose(() => update({}))
                            .setTitle("Change Title")
                            .addButton("Update", "close")
                            .allowUserClose()
                            .open()
                    })
            ).asComponent()
    ],
    [ "Artists", "max-content", ({ Id }) =>
        View(({ update }) => Box(
            ...JSON.parse(formData.get(`song-${Id}-artists`)?.toString() ?? "[]").map(([ name, url, _type ]: string[]) =>
                ProfilePicture(url ? Custom(img(url)) : PlainText(""), name)
            ),
            IconButton("add")
        )
            .addClass("artists-list")
            .onClick(() => {
                EditArtists(formData.get(`song-${Id}-artists`) ? JSON.parse(formData.get(`song-${Id}-artists`)!.toString()) : [ [ "", "", "PRIMARY" ] ]).then((x) => {
                    formData.set(`song-${Id}-artists`, JSON.stringify(x));
                    update({})
                })
            })
        ).asComponent()
    ],
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
    ]
];