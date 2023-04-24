import { State } from "webgen/mod.ts";
import { Drop, Payout } from "../../spec/music.ts";

export const state = State({
    loaded: false,
    published: <Drop[] | undefined>undefined,
    unpublished: <Drop[] | undefined>undefined,
    drafts: <Drop[] | undefined>undefined,
    payouts: <Payout[] | undefined>undefined
});