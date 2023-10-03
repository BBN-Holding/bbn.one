import { Component } from "webgen/mod.ts";

export type GridItem = Component | [ settings: {
    width?: number | undefined;
    heigth?: number | undefined;
}, element: Component ];