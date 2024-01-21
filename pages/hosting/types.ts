import { Component, IconButtonComponent, Reference } from "webgen/mod.ts";
import { PowerState } from "../../spec/music.ts";

export type StateActions = {
    [ type in PowerState ]: Component | IconButtonComponent;
};

export type GridItem = Component | [ settings: {
    width?: number | undefined;
    heigth?: number | undefined;
}, element: Component ];

export type RemotePath = {
    name: string;
    size?: number;
    canWrite?: boolean;
    lastModified?: number;
    fileMimeType?: string;
    uploadingRatio?: Reference<number>;
};