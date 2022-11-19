// deno-lint-ignore no-explicit-any
type Validator = (factory: typeof import("https://deno.land/x/zod@v3.19.1/mod.ts")) => any;

export const MusicPageOne: Validator = (zod) => zod.object({
    upc: zod.string().min(1).refine(x => x.trim()).or(zod.string().optional())
});

export const MusicPageTwo: Validator = (zod) => zod.object({
    title: zod.string().min(1).refine(x => x.trim()),
    artists: zod.string().or(zod.array(zod.string())),
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
    loading: zod.void(),
    artwork: zod.string()
}).strip();

export const MusicPageFive: Validator = (zod) => zod.object({
    loading: zod.void(),
    song: zod.string().min(1).or(zod.string().array().min(1))
});