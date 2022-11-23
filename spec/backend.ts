import * as zod from "https://deno.land/x/zod@v3.19.1/mod.ts";
import { ObjectId } from "https://deno.land/x/web_bson@v0.2.5/src/objectid.ts";
import { DropType, pureDrop, Requirements } from "./music.ts";

const database = {
    _id: zod.string().refine(x => ObjectId.isValid(x)).transform(x => new ObjectId(x)),
    user: zod.string().refine(x => ObjectId.isValid(x)).transform(x => new ObjectId(x)),
};

export const databaseDrop = pureDrop
    .partial()
    .extend({
        ...Requirements.posting,
        ...database,
        type: zod.literal(DropType.Unsubmitted),
    })
    .or(pureDrop
        .extend({
            ...Requirements.posting,
            ...database,
            type: zod.union([
                zod.literal(DropType.Private),
                zod.literal(DropType.Published),
                zod.literal(DropType.ReviewDeclined),
                zod.literal(DropType.UnderReview),
            ])
        })
    );


export type DatabaseDrop = zod.infer<typeof databaseDrop>;