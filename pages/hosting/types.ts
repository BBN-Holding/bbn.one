import { Component, IconButtonComponent, Pointer } from "webgen/mod.ts";
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
    size?: string;
    canWrite?: boolean;
    lastModified?: number;
    fileMimeType?: string;
    uploadingRatio?: Pointer<number>;
};