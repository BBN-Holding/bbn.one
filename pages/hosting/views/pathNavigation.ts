import { Box, Button, ButtonStyle, Component, Custom, Grid, loadingWheel } from "webgen/mod.ts";
import { listFiles } from "../loading.ts";
import { loading, path } from "./state.ts";

export function pathNavigation(): Component | [ settings: { width?: number | undefined; heigth?: number | undefined; }, element: Component ] {
    return path.map(list => Grid(
        ...list.split("/").filter((_, index, list) => (list.length - 1) != index).map((item, currentIndex, list) => Button(item || 'home')
            .setStyle(ButtonStyle.Secondary)
            .onClick(() => {
                path.setValue([ ...list.filter((_, listIndex) => listIndex <= currentIndex), '' ].join("/"));
                loading.setValue(true);
                listFiles(path.getValue()).finally(() => loading.setValue(false));
            })),
        Box(Custom(loadingWheel() as Element as HTMLElement)).addClass(loading.map(it => it ? "loading" : "non-loading"), "loading-box")
    ).setJustify("start").addClass("path-bar")).asRefComponent().removeFromLayout();
}
