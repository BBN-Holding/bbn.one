import { External } from "shared";
import { State } from "webgen/mod.ts";
import { Drop, File, OAuthApp, Payout, Server, Wallet } from "../../spec/music.ts";
import { ProfileData } from "../manager/helper.ts";

export const state = State({
    reviews: <External<Drop[]>>"loading",
    users: <External<ProfileData[]>>"loading",
    payouts: <External<Payout[]>>"loading",
    oauth: <External<OAuthApp[]>>"loading",
    files: <External<File[]>>"loading",
    servers: <External<Server[]>>"loading",
    wallets: <External<Wallet[]>>"loading",
});