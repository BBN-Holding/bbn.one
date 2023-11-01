import { State } from "webgen/mod.ts";
import { Meta, Server, ServerTypes } from "../../spec/music.ts";

export const MB = 1000_000;

export const state = State({
    loaded: false,
    servers: <(Server)[]>[],
    meta: <Meta>undefined!
});

export const creationState = State({
    loading: false,
    type: <ServerTypes | undefined>undefined,
});

export const detailsState = State({
    loaded: false,
    server: <Server | undefined>undefined,
});