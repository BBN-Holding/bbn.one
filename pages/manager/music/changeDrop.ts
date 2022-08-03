import { Button, ButtonStyle, Color, Custom, DropDownInput, Grid, Input, Page, Spacer, Wizard } from "webgen/mod.ts";
import { EditArtists, syncFromData } from "../helper.ts";
import { ActionBar } from "../misc/actionbar.ts";
import { changePage } from "../misc/common.ts";
import { Drop } from "../RESTSpec.ts";
import { EditViewState } from "./types.ts";
import language from "../../../data/language.json" assert { type: "json" };
import primary from "../../../data/primary.json" assert { type: "json" };

export function ChangeDrop(drop: Drop, update: (data: Partial<EditViewState>) => void) {
    return Wizard({
        cancelAction: () => { },
        submitAction: () => { },
    }, () => [
        Page(data => [
            ActionBar("Drop", undefined, {
                title: "Update", onclick: () => {

                }
            }, [ { title: drop.title ?? "(no-title)", onclick: changePage(update, "main") } ]),
            // TODO: Upload profile picture
            Grid(
                [
                    { width: 2 },
                    Input({
                        placeholder: "Title",
                        ...syncFromData(data, "title")
                    })
                ],
                (() => {
                    // TODO: Remake this hacky input to DateInput()
                    const input = Input({
                        value: data.get("release")?.toString(),
                        placeholder: "Release Date",
                        type: "date" as "text"
                    }).draw();
                    const rawInput = input.querySelector("input")!;
                    rawInput.style.paddingRight = "5px";
                    rawInput.onchange = () => data.set("release", rawInput.value);
                    return Custom(input);
                })(),
                DropDownInput("Language", language)
                    .syncFormData(data, "language")
                    .addClass("justify-content-space"),
                [
                    { width: 2 },
                    // TODO: Make this a nicer component
                    Button("Artists")
                        .onClick(() => {
                            EditArtists(data.get("artists") ? JSON.parse(data.get("artists")!.toString()) : [ [ "", "", "PRIMARY" ] ]).then((x) => data.set("artists", JSON.stringify(x)));
                        }),
                ],
                [ { width: 2 }, Spacer() ],
                DropDownInput("Primary Genre", primary)
                    .syncFormData(data, "primaryGenre")
                    .addClass("justify-content-space"),
                DropDownInput("Secondary Genre", primary)
                    .setStyle(ButtonStyle.Secondary)
                    .setColor(Color.Disabled),
                Input({
                    placeholder: "Composition Copyright",
                    ...syncFromData(data, "compositionCopyright")
                }),
                Input({
                    placeholder: "Sound Recording Copyright",
                    ...syncFromData(data, "soundRecordingCopyright")
                })
            )
                .setEvenColumns(2, "minmax(2rem, 20rem)")
                .addClass("settings-form")
                .addClass("limited-width")
                .setGap("15px")
        ]).setDefaultValues({
            title: drop.title,
            release: drop.release,
            language: drop.language,
            artists: JSON.stringify(drop.artists),
            primaryGenre: drop.primaryGenre,
            compositionCopyright: drop.compositionCopyright,
            soundRecordingCopyright: drop.soundRecordingCopyright
        })
    ]
    );
}