import * as zod from "https://deno.land/x/zod@v3.19.1/mod.ts";
import { ObjectId } from "https://deno.land/x/web_bson@v0.2.5/src/objectid.ts";

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
    zod.string().transform(x => x.trim()),
    zod.string(),
    zod.nativeEnum(ArtistTypes)
]);

export const song = zod.object({
    id: zod.string(),
    isrc: zod.string().optional(),
    title: zod.string().min(1).transform(x => x.trim()),
    artists: artist.array().min(1),
    primaryGenre: zod.string(),
    secondaryGenre: zod.string(),
    country: zod.string(),
    year: zod.number(),
    explicit: zod.boolean(),
    file: zod.string({ required_error: "a Song is missing its file." }),
});

export const pageOne = zod.object({
    upc: zod.string().min(1).transform(x => x.trim() || undefined).or(zod.any().transform(_ => undefined))
});

export const pageTwo = zod.object({
    title: zod.string().min(1).refine(x => x.trim()),
    artists: artist.array().min(1),
    release: zod.string(),
    language: zod.string(),
    primaryGenre: zod.string(),
    secondaryGenre: zod.string()
});

export const pageThree = zod.object({
    compositionCopyright: zod.string().min(1).refine(x => x.trim()),
    soundRecordingCopyright: zod.string().min(1).refine(x => x.trim())
});

export const pageFour = zod.object({
    loading: zod.literal(false, { description: "Upload still in progress" }),
    artwork: zod.string()
}).strip();

export const pageFive = zod.object({
    uploadingSongs: zod.array(zod.string()).max(0, { message: "Some uploads are still in progress" }),
    songs: song.array().min(1)
});

export const drop = pageOne
    .merge(pageTwo)
    .merge(pageThree)
    .merge(pageFour)
    .merge(pageFive);

export const databaseRequirements = {
    _id: zod.string().refine(x => ObjectId.isValid(x)).transform(x => new ObjectId(x)),
    user: zod.string().refine(x => ObjectId.isValid(x)).transform(x => new ObjectId(x)),
    loading: zod.void(),
    uploadingSongs: zod.void(),
};
export const databaseDrop = drop.partial().extend({
    ...databaseRequirements,
    type: zod.literal(DropType.Unsubmitted),
    songs: song.extend({
        file: zod.string().refine(x => ObjectId.isValid(x)).transform(x => new ObjectId(x))
    }).array().min(1).optional()
}).or(drop.extend({
    ...databaseRequirements,
    type: zod.union([
        zod.literal(DropType.Private),
        zod.literal(DropType.Published),
        zod.literal(DropType.ReviewDeclined),
        zod.literal(DropType.UnderReview),
    ]),
    songs: song.extend({
        file: zod.string().refine(x => ObjectId.isValid(x)).transform(x => new ObjectId(x))
    }).array().min(1)
}));

export type DatabaseDrop = zod.infer<typeof databaseDrop>;
export type Drop = zod.infer<typeof drop>;
export type Artist = zod.infer<typeof artist>;
export type Song = zod.infer<typeof song>;