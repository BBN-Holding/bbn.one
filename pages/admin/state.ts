import { State } from "webgen/mod.ts";
import { ProfileData } from "../manager/helper.ts";
import { Drop, OAuthApp, Payout, File } from "../../spec/music.ts";

export const state = State({
    loaded: false,

    reviews: <Drop[] | undefined>undefined,
    users: <ProfileData[] | undefined>undefined,
    payouts: <Payout[] | undefined>undefined,
    oauth: <OAuthApp[] | undefined>undefined,
    files: <File[] | undefined>undefined,

    disableDialog: true
});