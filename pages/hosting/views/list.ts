import { Dialog, Label, Vertical } from "webgen/mod.ts";
import locations from "../../../data/locations.json" assert { type: "json" };
import { Location } from "../../../spec/music.ts";
import './list.css';

export const moveDialog = (name: string, from: Location, to: Location) => Dialog(() => Vertical(
    Label(`We are moving your Server '${name}' to a diffrent location.`)
        .setFont(1, 400),
    Label(`This could take some time. Moving form ${locations[ from ]} to ${locations[ to ]}.`)
        .setFont(1, 400),
))
    .setTitle("Moving your Server!")
    .addButton("Okay", "remove")
    .open();