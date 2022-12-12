import * as zod from "https://deno.land/x/zod@v3.19.1/mod.ts";

export const userString = zod.string().min(1).refine(x => x.trim()).transform(x => x.trim());

export enum DropType {
    Published = 'PUBLISHED',
    Private = 'PRIVATE',
    UnderReview = 'UNDER_REVIEW',
    Unsubmitted = 'UNSUBMITTED',
    ReviewDeclined = "REVIEW_DECLINED"
}

export enum ArtistTypes {
    Primary = "PRIMARY",
    Featuring = "FEATURING",
    Songwriter = "SONGWRITER",
    Producer = "PRODUCER"
}
export const artist = zod.tuple([
    userString,
    zod.string(),
    zod.nativeEnum(ArtistTypes)
]);

export const song = zod.object({
    id: zod.string(),
    isrc: zod.string().optional(),
    title: userString,
    artists: artist.array().min(1),
    primaryGenre: zod.string(),
    secondaryGenre: zod.string(),
    country: zod.string(),
    year: zod.number(),
    explicit: zod.boolean(),
    file: zod.string({ required_error: "a Song is missing its file." }),
    progress: zod.number().optional().transform(x => <typeof x>undefined)
});

export const pageOne = zod.object({
    upc: zod.string().min(1).transform(x => x.trim() || undefined).optional()
});

export const pageTwo = zod.object({
    title: userString,
    artists: artist.array().min(1),
    release: zod.string(),
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


export const Requirements = {
    posting: {
        loading: zod.void(),
        uploadingSongs: zod.void(),
    },
    frontend: {
        _id: zod.string(),
        user: zod.string()
    }
};

export const drop = pureDrop
    .partial()
    .extend({
        ...Requirements.posting,
        ...Requirements.frontend,
        type: zod.literal(DropType.Unsubmitted),
    })
    .or(pureDrop
        .extend({
            ...Requirements.posting,
            ...Requirements.frontend,
            type: zod.union([
                zod.literal(DropType.Private),
                zod.literal(DropType.Published),
                zod.literal(DropType.ReviewDeclined),
                zod.literal(DropType.UnderReview),
            ])
        })
    );

export type Drop = zod.infer<typeof drop>;
export type PureDrop = zod.infer<typeof pureDrop>;
export type Artist = zod.infer<typeof artist>;
export type Song = zod.infer<typeof song>;