import * as zod from "https://deno.land/x/zod@v3.20.2/mod.ts";

const DATE_PATTERN = /\d\d\d\d-\d\d-\d\d/;
export const userString = zod.string().min(1).refine(x => x.trim()).transform(x => x.trim());

export enum DropType {
    Published = 'PUBLISHED',
    Publishing = 'PUBLISHING',
    Private = 'PRIVATE',
    UnderReview = 'UNDER_REVIEW',
    Unsubmitted = 'UNSUBMITTED',
    ReviewDeclined = "REVIEW_DECLINED"
}

export enum DataHints {
    InvalidData = "INVALID_DATA",
    DeadLinks = "DEAD_LINKS"
}

export enum ArtistTypes {
    Primary = "PRIMARY",
    Featuring = "FEATURING",
    Songwriter = "SONGWRITER",
    Producer = "PRODUCER"
}

export enum ReviewResponse {
    Approved = "APPROVED",
    DeclineCopyright = "DECLINE_COPYRIGHT",
    DeclineMaliciousActivity = "DECLINE_MALICIOUS_ACTIVITY"
}

export const artist = zod.tuple([
    userString,
    zod.string(),
    zod.nativeEnum(ArtistTypes)
]);

export const song = zod.object({
    id: zod.string(),
    dataHints: zod.nativeEnum(DataHints).optional(),
    isrc: zod.string().optional(),
    title: userString,
    artists: artist.array().min(1),
    primaryGenre: zod.string(),
    secondaryGenre: zod.string(),
    year: zod.number(),
    //TODO: no optional
    country: zod.string().optional(),
    language: zod.string().optional(),
    explicit: zod.boolean(),
    instrumental: zod.boolean().optional(),
    file: zod.string({ required_error: "a Song is missing its file." }),
    progress: zod.number().optional().transform(x => <typeof x>undefined)
});

export const pageOne = zod.object({
    upc: zod.string().min(1).transform(x => x.trim() || undefined).optional()
});

export const pageTwo = zod.object({
    title: userString,
    artists: artist.array().min(1),
    release: zod.string().regex(DATE_PATTERN, { message: "Not a date" }),
    language: zod.string(),
    primaryGenre: zod.string(),
    secondaryGenre: zod.string()
});

export const pageThree = zod.object({
    compositionCopyright: userString,
    soundRecordingCopyright: userString
});

export const pageFour = zod.object({
    loading: zod.literal(false, { description: "Upload still in progress" }).transform(_ => undefined),
    artwork: zod.string()
});

export const pageFive = zod.object({
    uploadingSongs: zod.array(zod.string()).max(0, { message: "Some uploads are still in progress" }).transform(_ => undefined),
    songs: song.array().min(1)
});

export const pageSix = zod.object({
    comments: userString.optional()
});

export const pureDrop = pageOne
    .merge(pageTwo)
    .merge(pageThree)
    .merge(pageFour)
    .merge(pageFive)
    .merge(pageSix);

export const drop = pureDrop
    .merge(zod.object({
        _id: zod.string(),
        lastChanged: zod.number().describe("unix timestamp").optional(),
        user: zod.string(),
        dataHints: zod.nativeEnum(DataHints).optional(),
        type: zod.nativeEnum(DropType).optional(),
        reviewResponse: zod.nativeEnum(ReviewResponse).optional()
    }));

export const payout = zod.object({
    _id: zod.string(),
    importer: zod.string(),
    file: zod.string(),
    period: zod.string().optional(),
    moneythisperiod: zod.string().optional(),
    entries: zod.array(
        zod.object({
            isrc: zod.string(),
            user: zod.string(),
            data: zod.array(
                zod.object({
                    distributor: zod.string(),
                    territory: zod.string(),
                    quantity: zod.number(),
                    revenue: zod.string()
                })
            )
        })
    ).optional()
});

export type Drop = zod.infer<typeof drop>;
export type PureDrop = zod.infer<typeof pureDrop>;
export type Artist = zod.infer<typeof artist>;
export type Song = zod.infer<typeof song>;
export type Payout = zod.infer<typeof payout>;