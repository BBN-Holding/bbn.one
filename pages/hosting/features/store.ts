import { Card, Grid, PlainText, Reactive, Vertical } from "https://raw.githubusercontent.com/lucsoft/WebGen/3f922fc/mod.ts";
import { data } from "../data.ts";

export const storeView = Reactive(data, "meta", () => Grid(
    Card(Vertical(
        PlainText("Nothing here yet")
    ).setPadding("1rem"))
)
    .setDynamicColumns(1, "10rem")
    .addClass("center-content", "limited-width"));