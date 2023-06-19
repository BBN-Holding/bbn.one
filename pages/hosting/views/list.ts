import { Component, Dialog, IconButtonComponent, MaterialIcons, PlainText, Vertical } from "webgen/mod.ts";
import locations from "../../../data/locations.json" assert { type: "json" };
import { Location, PowerState, Server } from "../../../spec/music.ts";
import './list.css';

new MaterialIcons();

type StateActions = {
    [ type in PowerState ]: Component | IconButtonComponent;
};

export const moveDialog = (name: string, from: Location, to: Location) => Dialog(() => Vertical(
    PlainText(`We are moving your Server '${name}' to a diffrent location.`)
        .setFont(1, 400),
    PlainText(`This could take some time. Moving form ${locations[ from ]} to ${locations[ to ]}.`)
        .setFont(1, 400),
))
    .setTitle("Moving your Server!")
    .addButton("Okay", "remove")
    .open();


export function ExplainerText(servers: Server[]) {
    return servers.length == 0 ?
        Vertical(
            PlainText("No Servers")
                .addClass("list-title")
                .setMargin("0"),
            PlainText("Welcome! Create a server to get going. 🤖🛠️"),
        ).setGap("1rem")
        : null;
}