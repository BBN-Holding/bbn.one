import '../../assets/css/main.css';
import '../../assets/css/components/subsidiaries.css';
import '../../assets/css/wizard.css';
import { DynaNavigation } from "../../components/nav.ts";
import primary from "../../data/primary.json" assert { type: "json"};
import language from "../../data/language.json" assert { type: "json"};

import { Checkbox, View, WebGen, Horizontal, PlainText, Vertical, Spacer, Input, Button, ButtonStyle, SupportedThemes, Grid, MaterialIcons, Color, Component, DropDownInput, Wizard, Page, Box } from "../../deps.ts";
import { ColumEntry, TableData } from "./types.ts";
import { Center, CenterAndRight, DropAreaInput, getYearList, Table, UploadTable } from "./helper.ts";

WebGen({
    theme: SupportedThemes.dark,
    icon: new MaterialIcons()
})

const gapSize = "15px";
const inputWidth = "436px";
function linkFormData(formData: FormData, key: string) {
    return {
        liveOn: (value: string) => formData.set(key, value),
        value: formData.get(key)?.toString(),
    }
}

const TableDef = (formData: FormData) => <ColumEntry<TableData>[]>[
    [ "Name", "auto", ({ Name }) => PlainText(Name).setFont(1, 500) ],
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
    [ "Explicit", "max-content", ({ Explicit }) =>
        Checkbox(Explicit)
    ],
];

// TODO: Live-Sync
// TODO: "Upload" zu FormDaten Supporten
// TODO: Input zu neuen FormComponents umlagern
View(() => Vertical(
    DynaNavigation("Music"),
    Spacer(),
    Wizard({
        cancelAction: "/music",
        buttonArrangement: "space-between",
        submitAction: () => {

        }
    }, ({ Next }) => [
        Page((formData) => [
            PlainText("Lets make your Drop hit!"),
            Spacer(),
            Horizontal(
                Spacer(),
                Vertical(
                    Center(PlainText("First we need an UPC/EAN number:")),
                    Input({
                        ...linkFormData(formData, "upc"),
                        placeholder: "UPC/EAN"
                    }).setWidth(inputWidth),
                    Button("I don't have one")
                        .setJustify("center")
                        .setStyle(ButtonStyle.Secondary)
                        .onClick(Next)
                ).setGap(gapSize),
                Spacer()
            ),
        ]),
        Page((formData) => [
            Spacer(),
            Center(
                Vertical(
                    Center(PlainText("Enter your Album details.")),
                    Input({
                        ...linkFormData(formData, "name"),
                        placeholder: "Name"
                    }).setWidth(inputWidth),
                    Grid(
                        Input({
                            ...linkFormData(formData, "releaseDate"),
                            placeholder: "Release Date",
                            type: "text"
                        }),
                        DropDownInput("Language", language)
                            .syncFormData(formData, "language")
                            .addClass("custom")
                    )
                        .setEvenColumns(2)
                        .setGap(gapSize)
                        .setWidth(inputWidth),
                    Input({
                        placeholder: "Artistlist",
                        ...linkFormData(formData, "artistList"),
                    }),
                    Center(PlainText("Set your target Audience")),
                    Grid(
                        DropDownInput("Primary Genre", primary)
                            .syncFormData(formData, "primaryGenre")
                            .addClass("custom"),
                        DropDownInput("Secondary Genre", primary)
                            .setStyle(ButtonStyle.Secondary)
                            .setColor(Color.Disabled),
                    )
                        .setGap(gapSize)
                        .setEvenColumns(2)
                ).setGap(gapSize)
            ),
        ]),
        Page((formData) => [
            Spacer(),
            Center(
                Vertical(
                    Center(PlainText("Display the Copyright")),
                    Input({
                        placeholder: "Composition Copyright",
                        ...linkFormData(formData, "compositionCopyright")
                    })
                        .setWidth(inputWidth),
                    Input({
                        placeholder: "Sound Recording Copyright",
                        ...linkFormData(formData, "soundRecordingCopyright")
                    })
                        .setWidth(inputWidth),
                )
                    .setGap(gapSize)
            ),
        ]),
        Page((_formData) => [
            Spacer(),
            Center(
                Vertical(
                    CenterAndRight(
                        PlainText("Upload your Cover"),
                        Button("Manual Upload")
                    ),
                    DropAreaInput("Drag & Drop your File here")
                )
                    .setGap(gapSize)
            ),
        ]),
        Page((formData) => [
            Spacer(),
            Horizontal(
                Spacer(),
                Vertical(
                    CenterAndRight(
                        PlainText("Upload your Cover"),
                        Button("Manual Upload")
                    ),
                    formData.has("songs") ?
                        Table<TableData>(TableDef(formData), [])
                            .addClass("inverted-class")
                        : UploadTable(TableDef(formData))
                            .addClass("inverted-class")

                ).setGap(gapSize),
                Spacer()
            ),
        ]),
        Page((_formData) => [
            Spacer(),
            Horizontal(
                Spacer(),
                PlainText("Thank! Thats everything we need."),
                Spacer(),
            ),
            Horizontal(
                Spacer(),
                Input({
                    placeholder: "Comments for Submit"
                }),
                Spacer()
            ),
        ])
    ])
))
    .addClass("fullscreen")
    .appendOn(document.body)