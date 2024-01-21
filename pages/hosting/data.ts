import { asState } from "webgen/mod.ts";
import { Meta, Server, ServerTypes } from "../../spec/music.ts";

export const MB = 1000000;

export const state = asState({
    loaded: false,
    servers: <Server[]>[],
    meta: <Meta>undefined!
});

export const creationState = asState({
    loading: false,
    type: <ServerTypes | undefined>undefined,
    versions: <string[]>[]
});