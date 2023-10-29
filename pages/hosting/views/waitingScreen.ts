import { Component, Grid, Label } from "webgen/mod.ts";

export function DisconnectedScreen(): Component {
    return Grid(
        Grid(
            Label("Connecting to server...", "h1"),
            Label("Waiting for server availability")
        ).setJustify("center")
    ).addClass("disconnected-screen");
}
