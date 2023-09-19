import * as zod from "https://deno.land/x/zod@v3.21.4/mod.ts";
import { string } from "https://deno.land/x/zod@v3.21.4/types.ts";

const DATE_PATTERN = /\d\d\d\d-\d\d-\d\d/;
export const userString = zod.string().min(1).refine(x => x.trim()).transform(x => x.trim());

export enum DropType {
    Published = 'PUBLISHED', // Uploaded, Approved
    Publishing = 'PUBLISHING', // Uploading
    Private = 'PRIVATE', // Declined, can be resubmitted
    UnderReview = 'UNDER_REVIEW',
    Unsubmitted = 'UNSUBMITTED', // Draft
    ReviewDeclined = "REVIEW_DECLINED" // Rejected, cant be resubmitted
    /*
        1: Drafts - Not on Store
            - Draft: Submit (No Fields locked, submitted => Under Review)
            - Under Review (Drafts): Cancel (Reviewers can approve or decline with a reason, declined => Draft with Reason, approved => Publishing, Cancel => Draft)
            - Publishing (Drafts): Take Down Request (Backend is uploading the files and waits for Batch Delivery to complete and sets type to Published, Take Down Request => Takedown Pending)
        2: On Store
            - Revision: Submit (Some fields are locked, Show Changes to Reviewer, submitted => Under Review)
            - Under Review (Revisions): Cancel (Reviewers can approve or decline with a reason, declined => Draft with Reason, approved => Publishing, Cancel => Revision)
            - Publishing (Revisions): Take Down Request (Backend is uploading the files and waits for Batch Delivery to complete and sets type to Published, Take Down Request => Takedown Pending)
            - Published: Take Down Request, Edit (Take Down Request => Takedown Pending, Edit => Revision)
        3: Takendowns
            - Takedown Review: Cancel (Cancel => Published) (On Store Label)
            - Takedown Pending: None (On Store Label)
            - Takedowns: None
        History:
            When in Editing Mode, changes are saved to other object,
                when approved or declined, the changes are pushed into history array,
                when approved, the changes are applied to the main object
    */
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
    isrc: zod.string().optional(),
    title: userString,
    artists: artist.array().min(1),
    primaryGenre: zod.string(),
    secondaryGenre: zod.string(),
    year: zod.number(),
    country: zod.string(),
    //TODO: Add in frontend mby
    language: zod.string().optional(),
    explicit: zod.boolean(),
    instrumental: zod.boolean(),
    file: zod.string({ required_error: "a Song is missing its file." }),
    progress: zod.number().optional().transform(x => <typeof x>undefined)
})
    .refine(({ instrumental, explicit }) => !(instrumental && explicit), "Can't have an explicit instrumental song");

export const pageOne = zod.object({
    upc: zod.string().nullish()
        .transform(x => x?.trim())
        .transform(x => x?.length == 0 ? null : x)
        .refine(x => x == null || x.length > 0, { message: "Not a valid UPC" })
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
        user: zod.string(),
        type: zod.nativeEnum(DropType),
    }));

export const payout = zod.object({
    _id: zod.string(),
    importer: zod.string(),
    file: zod.string(),
    period: zod.string(),
    moneythisperiod: zod.string(),
    entries: zod.object({
        isrc: zod.string(),
        user: zod.string(),
        data: zod.array(
            zod.object({
                store: zod.string(),
                territory: zod.string(),
                quantity: zod.number(),
                revenue: zod.number()
            })
        )
    }).array()
});

export const oauthapp = zod.object({
    _id: zod.string(),
    name: userString,
    redirect: zod.string().url().array(),
    secret: zod.string(),
    icon: zod.string()
});

export const file = zod.object({
    _id: zod.string(),
    length: zod.number(),
    chunkSize: zod.number(),
    uploadDate: zod.string(),
    filename: zod.string(),
    metadata: zod.object({
        type: zod.string(),
    })
});

export enum PaymentType {
    Restrained = "RESTRAINED", // cannot be withdrawn (when adding funds to account)
    Unrestrained = "UNRESTRAINED" // can be withdrawn
}

export const wallet = zod.object({
    _id: zod.string(),
    transactions: zod.object({
        amount: zod.number(), // positive for incoming, negative for outgoing
        timestamp: zod.string(),
        type: zod.nativeEnum(PaymentType),
        description: zod.string(),
        counterParty: zod.string()
    }).array(),
    cut: zod.number(),
    user: zod.string(),
    userName: zod.string(),
    email: zod.string(),
    balance: zod.object({
        restrained: zod.number(),
        unrestrained: zod.number()
    }).optional()
});

export const limits = zod.object({
    memory: zod.number(),
    disk: zod.number(),
    cpu: zod.number()
});

export enum ServerTypes {
    Vanilla = "/minecraft/vanilla/",
    Default = "/minecraft/default/",
    Fabric = "/minecraft/modded/fabric/",
    Forge = "/minecraft/modded/forge/",
    Bedrock = "/minecraft/bedrock/",
    PocketMine = "/minecraft/pocketmine/",
    LegacyPurpur = "/minecraft/legacy/purpur/",
    LegacyMagma = "/minecraft/legacy/magma/",
    LegacyNukkit = "/minecraft/legacy/nukkit/",
    LegacyPGF = "/minecraft/legacy/pgf/",
}

export const serverState = zod.enum([ "offline", "starting", "stopping", "running", "installing", "start", "stop", "kill", "restart", "moving" ]);

export const location = zod.enum([ "bbn-fsn", "bbn-hel", "bbn-mum", "bbn-sgp" ]);

export const server = zod.object({
    _id: zod.string(),
    name: zod.string().max(30),
    type: zod.nativeEnum(ServerTypes),
    location,
    limits,
    state: serverState,
    address: zod.string().optional(),
    ports: zod.number().array(),
    user: zod.string(),
    identifier: zod.string().optional(),
    stateSince: zod.number().describe("unix timestamp"),
    labels: zod.enum([ "legacy", "suspended", "contact-support" ]).array()
});

export const kubeServer = server.extend({
    kube: zod.object({
        type: zod.string()
    })
});

export const serverCreate = zod.object({
    name: string().min(3).max(20),
    type: zod.nativeEnum(ServerTypes),
    location,
    limits,
});

export const metaLimti = limits.extend({
    slots: zod.number()
});

export const storeItems = zod.enum([ "memory", "disk", "cpu", "slots" ]);

export const meta = zod.object({
    _id: zod.string(),
    owner: zod.string(),
    pteroId: zod.number().optional(),
    migrationPassword: zod.string().optional(),
    coins: zod.number(),
    limits: metaLimti,
    used: metaLimti,
    pricing: zod.record(storeItems, zod.object({
        price: zod.number(),
        amount: zod.number()
    }))
});

export const bugReport = zod.object({
    type: zod.literal("web-frontend"),
    error: zod.string(),
    errorStack: zod.string(),
    platform: zod.string().optional(),
    platformVersion: zod.string().optional(),
    browserVersion: zod.string().optional(),
    browser: zod.string().optional(),
    userId: zod.string().optional(),
    location: zod.string()
});

export const transcript = zod.object({
    messages: zod.object({
        author: zod.string(),
        authorid: zod.string(),
        content: zod.string(),
        timestamp: zod.string(),
        avatar: zod.string(),
        attachments: zod.array(zod.string()).optional(),
        embeds: zod.array(zod.any()).optional(),
    }).array(),
    closed: zod.string(),
    with: zod.string(),
    _id: zod.string(),
});

export const serverDetails = zod.union([
    zod.object({
        type: zod.literal("features"),
        enabled: zod.enum([
            "stdin",
            "stdout",
            "mc-java-players",
            // "mc-java-files",
            // "mc-java-settings"
        ]).array()
    }),
    zod.object({
        type: zod.literal("deleted"),
    }),
    zod.object({
        type: zod.literal("unreachable"),
    }),
    zod.object({
        type: zod.literal("stdout"),
        chunk: zod.string(),
        clearConsole: zod.literal(true).optional()
    }),
    zod.object({
        type: zod.literal("mc-java-players"),
        // TODO: Add spec data
    }),
    zod.object({
        type: zod.literal("stats"),
        cpu: zod.number(),
        memory: zod.number(),
        disk: zod.number(),
    }),
]).and(zod.object({
    _id: zod.string()
}));

export const enum AuditTypes {
    StorePurchase = "store-purchase",
    ServerCreate = "server-create",
    ServerPowerChange = "server-power-change",
    ServerModify = "server-modify",
    ServerDelete = "server-delete"
}

export enum OAuthScopes {
    Profile = "profile",
    Email = "email",
    Phone = "phone",
}

export type AdminStats = { drops: { all: number, reviews: number, publishing: number, published: number, private: number, rejected: number, drafts: number; }, users: number, payouts: number, oauthApps: number, files: number, servers: number, wallets: number; };

export type Artist = zod.infer<typeof artist>;
export type BugReport = zod.infer<typeof bugReport>;
export type Drop = zod.infer<typeof drop>;
export type File = zod.infer<typeof file>;
export type Limits = zod.infer<typeof limits>;
export type Location = zod.infer<typeof location>;
export type Meta = zod.infer<typeof meta>;
export type OAuthApp = zod.infer<typeof oauthapp>;
export type Payout = zod.infer<typeof payout>;
export type KubeServer = zod.infer<typeof kubeServer>;
export type PowerState = zod.infer<typeof serverState>;
export type PureDrop = zod.infer<typeof pureDrop>;
export type Server = zod.infer<typeof server>;
export type ServerCreate = zod.infer<typeof serverCreate>;
export type ServerDetails = zod.infer<typeof serverDetails>;
export type Song = zod.infer<typeof song>;
export type StoreItems = zod.infer<typeof storeItems>;
export type Transcript = zod.infer<typeof transcript>;
export type Wallet = zod.infer<typeof wallet>;