import { External } from "shared";
import { State } from "webgen/mod.ts";
import { Drop, File, OAuthApp, Payout, Server, Wallet } from "../../spec/music.ts";
import { ProfileData } from "../manager/helper.ts";

export const state = State({
    loaded: false,

    reviews: <Drop[] | undefined>undefined,
    users: <ProfileData[] | undefined>undefined,
    payouts: <Payout[] | undefined>undefined,
    oauth: <External<OAuthApp[]>>"loading",
    files: <File[] | undefined>undefined,
    servers: <Server[] | undefined>undefined,
    wallets: <Wallet[] | undefined>undefined,
});