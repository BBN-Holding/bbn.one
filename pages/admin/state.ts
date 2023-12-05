import { External } from "shared/mod.ts";
import { State } from "webgen/mod.ts";
import { AdminStats, Drop, File, Group, OAuthApp, Payout, Server, Transcript, Wallet } from "../../spec/music.ts";
import { ProfileData } from "../_legacy/helper.ts";

export const state = State({
    drops: {
        reviews: <External<Drop[]> | "loading">"loading",
        publishing: <External<Drop[]> | "loading">"loading",
        published: <External<Drop[]> | "loading">"loading",
        private: <External<Drop[]> | "loading">"loading",
        rejected: <External<Drop[]> | "loading">"loading",
        drafts: <External<Drop[]> | "loading">"loading",
    },
    users: <External<ProfileData[]> | "loading">"loading",
    groups: <External<Group[]> | "loading">"loading",
    payouts: <External<Payout[]> | "loading">"loading",
    oauth: <External<OAuthApp[]> | "loading">"loading",
    files: <External<File[]> | "loading">"loading",
    servers: <External<Server[]> | "loading">"loading",
    wallets: <External<Wallet[]> | "loading">"loading",
    transcripts: <External<Transcript[]> | "loading">"loading",
    stats: <External<AdminStats> | "loading">"loading",
});

export const reviewState = State({
    drop: <Drop | undefined>undefined,
    drops: <Drop[] | undefined>undefined,
});