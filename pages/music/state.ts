import { AdvancedImage, asState } from "webgen/mod.ts";
import { zod } from "webgen/zod.ts";
import { ArtistRef, Drop, Payout, Song } from "../../spec/music.ts";

export const state = asState({
    published: <Drop[] | "loading"> "loading",
    unpublished: <Drop[] | "loading"> "loading",
    drafts: <Drop[] | "loading"> "loading",
    payouts: <Payout[] | "loading"> "loading",
});

export const creationState = asState({
    loaded: false,
    _id: <string | undefined> undefined,
    gtin: <string | undefined | null> undefined,
    title: <string | undefined> undefined,
    release: <string | undefined> undefined,
    language: <string | undefined> undefined,
    artists: <ArtistRef[]> [],
    primaryGenre: <string | undefined> undefined,
    secondaryGenre: <string | undefined> undefined,
    compositionCopyright: <string | undefined> undefined,
    soundRecordingCopyright: <string | undefined> undefined,
    artwork: <string | undefined> undefined,
    artworkClientData: <AdvancedImage | undefined> undefined,
    loading: false,
    uploadingSongs: <string[]> [],
    songs: <Song[]> [],
    comments: <string | undefined> undefined,
    page: 0,
    validationState: <zod.ZodError | undefined> undefined,
});
