import { State } from "webgen/mod.ts";
import { Drop, Payout } from "../../spec/music.ts";

export const state = State({
    published: <Drop[] | "loading">"loading",
    unpublished: <Drop[] | "loading">"loading",
    drafts: <Drop[] | "loading">"loading",
    payouts: <Payout[] | "loading">"loading"
});