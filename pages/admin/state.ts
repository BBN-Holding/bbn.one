import { External } from "shared/mod.ts";
import { asState } from "webgen/mod.ts";
import { Drop, File, Group, OAuthApp, Payout, Server, Transcript, Wallet } from "../../spec/music.ts";
import { ProfileData } from "../_legacy/helper.ts";

export const state = asState({
    drops: {
        reviews: <External<Drop[]> | "loading">"loading",
        publishing: <External<Drop[]> | "loading">"loading",
    },
    groups: <External<Group[]> | "loading">"loading",
    payouts: <External<Payout[][]> | "loading">"loading",
    oauth: <External<OAuthApp[]> | "loading">"loading",
    files: <External<File[]> | "loading">"loading",
    wallets: <External<Wallet[]> | "loading">"loading",
    search: <({ type: "transcript", val: Transcript; } | { type: "drop", val: Drop; } | { type: "server", val: Server; } | { type: "user", val: ProfileData; })[]>[],
});

export const reviewState = asState({
    // deno-lint-ignore no-explicit-any
    drop: <Drop & { user: ProfileData; events: any[]; } | undefined>undefined,
    drops: <Drop[] | undefined>undefined,
});