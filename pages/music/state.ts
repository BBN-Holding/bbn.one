import { State } from "webgen/mod.ts";
import { Drop } from "../../spec/music.ts";

export const state = State({
    loaded: false,
    published: <Drop[] | undefined>undefined,
    unpublished: <Drop[] | undefined>undefined,
    drafts: <Drop[] | undefined>undefined,
});