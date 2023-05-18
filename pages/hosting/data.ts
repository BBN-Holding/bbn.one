import { State } from "webgen/mod.ts";
import { Meta, Server } from "../../spec/music.ts";

export const MB = 1000_000;

export const state = State({
    loaded: false,
    servers: <(Server)[]>[],
    meta: <Meta>undefined!
});