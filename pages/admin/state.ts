import { External } from "shared/mod.ts";
import { asState } from "webgen/mod.ts";
import { Drop, File, Group, OAuthApp, Payout, Server, Transcript, Wallet } from "../../spec/music.ts";
import { ProfileData } from "../shared/helper.ts";

export const state = asState({
    drops: {
        reviews: <External<Drop[]> | "loading"> "loading",
        publishing: <External<Drop[]> | "loading"> "loading",
    },
    groups: <External<Group[]> | "loading"> "loading",
    payouts: <External<Payout[][]> | "loading"> "loading",
    oauth: <External<OAuthApp[]> | "loading"> "loading",
    files: <External<File[]> | "loading"> "loading",
    wallets: <External<Wallet[]> | "loading"> "loading",
    search: <({ _index: "transcripts"; _source: Transcript } | { _index: "drops"; _source: Drop } | { _index: "servers"; _source: Server } | { _index: "users"; _source: ProfileData } | { _index: "files"; _source: File } | { _index: "none" } | { _index: "searching" })[]>[],
    searchStats: <External<{ total: number; took: number }> | "loading"> "loading",
});

export const reviewState = asState({
    // deno-lint-ignore no-explicit-any
    drop: <Drop & { user: ProfileData; events: any[] } | undefined> undefined,
    drops: <Drop[] | undefined> undefined,
});
