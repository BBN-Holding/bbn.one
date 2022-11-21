// deno-lint-ignore no-explicit-any
type Validator = (factory: typeof import("https://deno.land/x/zod@v3.19.1/mod.ts")) => any;

export const MusicPageOne: Validator = (zod) => zod.object({
    upc: zod.string().min(1).refine(x => x.trim()).or(zod.string().optional())
});

export const MusicPageTwo: Validator = (zod) => zod.object({
    title: zod.string().min(1).refine(x => x.trim()),
    artists: zod.tuple([ zod.string(), zod.string(), zod.string() ]).array(),
    release: zod.string(),
    language: zod.string(),
    primaryGenre: zod.string(),
    secondaryGenre: zod.string()
});

export const MusicPageThree: Validator = (zod) => zod.object({
    compositionCopyright: zod.string().min(1).refine(x => x.trim()),
    soundRecordingCopyright: zod.string().min(1).refine(x => x.trim())
});

export const MusicPageFour: Validator = (zod) => zod.object({
    loading: zod.literal(false, { description: "Upload still in progress" }),
    artwork: zod.string()
}).strip();

export const MusicPageFive: Validator = (zod) => zod.object({
    uploadingSongs: zod.array(zod.string()).max(0, { message: "Some uploads are still in progress" }),
    songs: zod.array(zod.object({
        title: zod.string(),
        file: zod.string({ required_error: "a Song is missing its file." })
    })).min(1)
});