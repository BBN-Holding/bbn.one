import { Box, ButtonStyle, Checkbox, Color, Component, createElement, Custom, DropDownInput, IconButton, img, InputForm, PlainText, View } from "../../../deps.ts";
import { EditArtists, getYearList, stringToColour } from "../helper.ts";
import { ColumEntry } from "../types.ts";

import primary from "../../../data/primary.json" assert { type: "json"};
import language from "../../../data/language.json" assert { type: "json"};
import { accessibilityDisableTabOnDisabled } from "https://raw.githubusercontent.com/lucsoft/WebGen/1144da3a8dbcfb22253fb5c4bc8b3f92c4f208bf/src/lib/Accessibility.ts";
function ProfilePicture(component: Component, name: string) {
    const ele = component.draw();
    ele.style.backgroundColor = stringToColour(name);
    return Custom(ele).addClass("profile-picture");
}

// TODO: Move to WebGen and change content editable as inputs have a stupid size width limit and not just auto with
export class InlineTextInput extends InputForm<string> {
    constructor(color: Color = Color.Grayscaled) {
        super();
        this.wrapper.classList.add("winput", "inline", "has-value", color ?? Color.Grayscaled);
        this.wrapper.tabIndex = accessibilityDisableTabOnDisabled();
        const input = createElement("input") as HTMLInputElement;

        this.wrapper.append(input);
        input.addEventListener("change", () => {
            this.setValue(input.value);
        });

        this.addEventListener("update", (event) => {
            const value = (<CustomEvent<string>>event).detail;
            input.value = value;
            if (this.formData && this.key)
                this.formData.set(this.key, this.saveData(value));

        });
        this.wrapper.classList.add("isList");
    }
    saveData(data: string): FormDataEntryValue {
        return data;
    }
    parseData(data: FormDataEntryValue): string {
        return data.toString();
    }
    setStyle(_style: ButtonStyle): this {
        throw new Error("Method not implemented.");
    }
    setColor(_color: Color): this {
        throw new Error("Method not implemented.");
    }

}
export const TableDef = (formData: FormData) => <ColumEntry<{ Id: string; }>[]>[
    [ "Title", "auto", ({ Id }) =>
        formData.has(`song-${Id}-progress`) ? Box(
            Custom((() => {
                const element = createElement("progress");
                element.max = 100;
                element.value = parseFloat(formData.get(`song-${Id}-progress`)?.toString() ?? "");
                return element;
            })())
        ) : View(() => new InlineTextInput().syncFormData(formData, `song-${Id}-title`))
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
                    formData.set(`song-${Id}-artists`, JSON.stringify(x));
                    update({});
                });
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