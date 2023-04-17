import { State } from "webgen/mod.ts";
import { ProfileData } from "../manager/helper.ts";
import { Drop, Payout } from "../../spec/music.ts";

export const state = State({
    loaded: false,

    reviews: <Drop[] | undefined>undefined,
    users: <ProfileData[] | undefined>undefined,
    payouts: <Payout[] | undefined>undefined
});