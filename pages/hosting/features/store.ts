import { Card, Grid, PlainText, Reactive, Vertical } from "webgen/mod.ts";
import { state } from "../data.ts";

export const storeView = Reactive(state, "meta", () => Grid(
    Card(Vertical(
        PlainText("Nothing here yet")
    ).setPadding("1rem"))
)
    .setDynamicColumns(1, "10rem")
    .addClass("center-content", "limited-width"));