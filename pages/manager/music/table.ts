import { Box, ButtonStyle, Checkbox, ColumEntry, Component, createElement, Custom, DropDownInput, IconButton, img, InlineTextInput, PlainText, View } from "webgen/mod.ts";
import { EditArtists, getYearList, stringToColour, getSecondary } from "../helper.ts";
import primary from "../../../data/primary.json" assert { type: "json"};
import secondary from "../../../data/secondary.json" assert { type: "json"};
import language from "../../../data/language.json" assert { type: "json"};

function ProfilePicture(component: Component, name: string) {
    const ele = component.draw();
    ele.style.backgroundColor = stringToColour(name);
    return Custom(ele).addClass("profile-picture");
}

export const TableDef = (formData: FormData, update: (data: {}) => void) => <ColumEntry<{ Id: string; }>[]>[
    [ "Title", "auto", ({ Id }) =>
        formData.has(`song-${Id}-progress`) ? Box(
            Custom((() => {
                const element = createElement("progress");
                element.max = 110;
                element.value = parseFloat(formData.get(`song-${Id}-progress`)?.toString() ?? "");
                return element;
            })()).addClass("low-level")
        ) : View(() => InlineTextInput("text").sync(formData, `song-${Id}-title`).addClass("low-level"))
            .asComponent()
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
                    formData.set(`song-${Id}-artists`, JSON.stringify(x?.map(x => x.map(x => x.trim()))));
                    update({});
                });
            })
        ).asComponent()
    ],
    [ "Year", "max-content", ({ Id }) =>
        DropDownInput("Year", getYearList())
            .sync(formData, `song-${Id}-year`)
            .setStyle(ButtonStyle.Inline)
            .addClass("low-level")
    ],
    [ "Country", "max-content", ({ Id }) =>
        DropDownInput("Country", language)
            .sync(formData, `song-${Id}-country`)
            .setStyle(ButtonStyle.Inline)
            .addClass("low-level")
    ],
    [ "Primary Genre", "max-content", ({ Id }) =>
        DropDownInput("Primary Genre", primary)
            .sync(formData, `song-${Id}-primaryGenre`)
            .onChange(() => {
                formData.delete(`song-${Id}-secondaryGenre`);
                update({});
            })
            .setStyle(ButtonStyle.Inline)
            .addClass("low-level")
    ],
    [ "Secondary Genre", "max-content", ({ Id }) =>
        DropDownInput("Secondary Genre", getSecondary(secondary, formData, `song-${Id}-primaryGenre`) ?? [])
            .sync(formData, `song-${Id}-secondaryGenre`)
            .setStyle(ButtonStyle.Inline)
            .addClass("low-level")
    ],
    [ "Explicit", "max-content", ({ Id }) =>
        Checkbox(formData.get(`song-${Id}-explicit`) == "true")
            .onClick((_, value) => formData.set(`song-${Id}-explicit`, !value ? "true" : "false"))
            .addClass("low-level")
    ]
];