import { sumOf } from "@std/collections";
import { z } from "zod/mod.ts";

export const DATE_PATTERN = /\d\d\d\d-\d\d-\d\d/;
export const userString = z.string().min(1).transform((x) => x.trim()).openapi({ type: "string" });

export enum DropType {
    Published = "PUBLISHED", // Uploaded, Approved
    Publishing = "PUBLISHING", // Uploading
    Private = "PRIVATE", // Declined, can be resubmitted
    UnderReview = "UNDER_REVIEW",
    Unsubmitted = "UNSUBMITTED", // Draft
    ReviewDeclined = "REVIEW_DECLINED", // Rejected, cant be resubmitted
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
            Save changes in user-events collection along with the already existing action event
    */
}

export enum ArtistTypes {
    Primary = "PRIMARY",
    Featuring = "FEATURING",
    Songwriter = "SONGWRITER",
    Producer = "PRODUCER",
}

export enum ReviewResponse {
    Approved = "APPROVED",
    DeclineCopyright = "DECLINE_COPYRIGHT",
    DeclineMaliciousActivity = "DECLINE_MALICIOUS_ACTIVITY",
}

export const artist = z.object({
    _id: z.string(),
    name: userString,
    users: z.string().array(),
    avatar: z.string().optional(),
    spotify: z.string().optional(),
    apple: z.string().optional(),
});

export const artistref = z.object({
    _id: z.string(),
    type: z.literal(ArtistTypes.Primary).or(z.literal(ArtistTypes.Featuring)),
}).or(z.object({
    name: userString,
    type: z.literal(ArtistTypes.Producer).or(z.literal(ArtistTypes.Songwriter)),
}));

export const share = z.object({
    _id: z.string(),
    drop: z.string(),
    slug: z.string(),
    services: z.record(z.string()),
});

export const song = z.object({
    _id: z.string(),
    user: z.string().optional(),
    isrc: z.string().optional(),
    title: userString,
    artists: artistref.array().refine((x) => x.some(({ type }) => type == "PRIMARY"), { message: "At least one primary artist is required" }).refine((x) => x.some(({ type }) => type == "SONGWRITER"), { message: "At least one songwriter is required" }),
    primaryGenre: z.string(),
    secondaryGenre: z.string(),
    year: z.number(),
    //add in frontend with additional info sheet
    country: z.string().optional(),
    language: z.string(),
    explicit: z.boolean(),
    instrumental: z.boolean(),
    file: z.string({ required_error: "a Song is missing its file." }),
});

export const pureDrop = z.object({
    gtin: z.string()
        .trim()
        .min(12, { message: "UPC/EAN: Invalid length" })
        .max(13, { message: "UPC/EAN: Invalid length" })
        .regex(/^\d+$/, { message: "UPC/EAN: Not a number" })
        .refine((gtin) => parseInt(gtin.slice(-1), 10) === (10 - (sumOf(gtin.slice(0, -1).split("").map((digit, index) => parseInt(digit, 10) * ((16 - gtin.length + index) % 2 === 0 ? 3 : 1)), (x) => x) % 10)) % 10, {
            message: "UPC/EAN: Invalid",
        }).optional(),
    title: userString,
    artists: artistref.array().refine((x) => x.some(({ type }) => type == "PRIMARY"), { message: "At least one primary artist is required" }).refine((x) => x.some(({ type }) => type == "SONGWRITER"), { message: "At least one songwriter is required" }),
    release: z.string().regex(DATE_PATTERN, { message: "Not a date" }),
    language: z.string(),
    primaryGenre: z.string(),
    secondaryGenre: z.string(),
    compositionCopyright: userString,
    soundRecordingCopyright: userString,
    artwork: z.string(),
    songs: z.string().array().min(1),
    comments: userString.optional(),
});

export const drop = pureDrop
    .merge(z.object({
        _id: z.string(),
        user: z.string(),
        type: z.nativeEnum(DropType),
    }));

const pageOne = z.object({
    title: userString,
    artists: artistref.array().refine((x) => x.some(({ type }) => type == "PRIMARY"), { message: "At least one primary artist is required" }).refine((x) => x.some(({ type }) => type == "SONGWRITER"), { message: "At least one songwriter is required" }),
    release: z.string().regex(DATE_PATTERN, { message: "Not a date" }),
    language: z.string(),
    primaryGenre: z.string(),
    secondaryGenre: z.string(),
    gtin: z.preprocess(
        (x) => x === "" ? undefined : x,
        z.string().trim()
            .min(12, { message: "UPC/EAN: Invalid length" })
            .max(13, { message: "UPC/EAN: Invalid length" })
            .regex(/^\d+$/, { message: "UPC/EAN: Not a number" })
            .refine((gtin) => parseInt(gtin.slice(-1), 10) === (10 - (sumOf(gtin.slice(0, -1).split("").map((digit, index) => parseInt(digit, 10) * ((16 - gtin.length + index) % 2 === 0 ? 3 : 1)), (x) => x) % 10)) % 10, {
                message: "UPC/EAN: Invalid checksum",
            }).optional(),
    ),
    compositionCopyright: userString,
    soundRecordingCopyright: userString,
});

const pageTwo = z.object({
    artwork: z.string(),
    artworkClientData: z.object({
        type: z.string().refine((x) => x !== "uploading", { message: "Artwork is still uploading" }),
    }).transform(() => undefined),
});

const pageThree = z.object({
    songs: song.array().min(1, { message: "At least one song is required" }).refine((songs) => songs.every(({ instrumental, explicit }) => !(instrumental && explicit)), "Can't have an explicit instrumental song"),
    uploadingSongs: z.array(z.string()).max(0, { message: "Some uploads are still in progress" }),
});

export const pages = <any[]> [pageOne, pageTwo, pageThree];

export const payout = z.object({
    _id: z.string(),
    file: z.string(),
    period: z.string(),
    entries: z.object({
        isrc: z.string(),
        data: z.array(
            z.object({
                store: z.string(),
                territory: z.string(),
                quantity: z.number(),
                revenue: z.number(),
            }),
        ),
    }).array(),
    user: z.string(),
});

export const oauthapp = z.object({
    _id: z.string(),
    name: userString,
    redirect: z.string().url().array(),
    secret: z.string(),
    icon: z.string(),
});

export const file = z.object({
    _id: z.string(),
    length: z.number(),
    chunkSize: z.number(),
    uploadDate: z.string(),
    filename: z.string(),
    metadata: z.object({
        type: z.string(),
    }),
});

export enum PaymentType {
    Restrained = "RESTRAINED", // cannot be withdrawn (when adding funds to account)
    Unrestrained = "UNRESTRAINED", // can be withdrawn
}

export enum AccountType {
    Default = "DEFAULT",
    Subscribed = "SUBSCRIBED",
    Vip = "VIP",
}

export const wallet = z.object({
    _id: z.string(),
    transactions: z.object({
        amount: z.number(), // positive for incoming, negative for outgoing
        timestamp: z.string(),
        type: z.nativeEnum(PaymentType),
        description: z.string(),
        counterParty: z.string(),
    }).array(),
    cut: z.number(),
    user: z.string(),
    userName: z.string().optional(),
    email: z.string().optional(),
    balance: z.object({
        restrained: z.number(),
        unrestrained: z.number(),
    }).optional(),
    stripeAccountId: z.string().optional(),
    accountType: z.nativeEnum(AccountType).default(AccountType.Default),
});

export const limits = z.object({
    memory: z.number(),
    disk: z.number(),
    cpu: z.number(),
});

export enum ServerTypes {
    Vanilla = "/minecraft/vanilla/",
    Default = "/minecraft/default/",
    Fabric = "/minecraft/modded/fabric/",
    Forge = "/minecraft/modded/forge/",
    Bedrock = "/minecraft/bedrock/",
    PocketMine = "/minecraft/pocketmine/",
}

export const serverPowerState = z.enum(["starting", "installing", "stopping", "running", "offline"]);
export const serverPowerActions = z.enum(["start", "stop", "kill"]);

export const location = z.enum(["bbn-fsn", "bbn-hel", "bbn-mum", "bbn-sgp"]);
export const serverLabels = z.enum([
    "suspended",
    "contact-support",
    "maintenance",
    "disabled",
]);

export const server = z.object({
    _id: z.string(),
    name: z.string().max(30),
    type: z.nativeEnum(ServerTypes),
    location,
    limits,
    state: serverPowerState,
    address: z.string().optional(),
    ports: z.number().array(),
    user: z.string(),
    stateSince: z.number().describe("unix timestamp"),
    labels: serverLabels.array(),
    version: z.string(),
});

export const serverCreate = z.object({
    name: z.string().min(3).max(20),
    type: z.nativeEnum(ServerTypes),
    location,
    limits: z.object({
        memory: limits.shape.memory.min(300, "Minimum memory is 300MB"),
        disk: limits.shape.disk.min(200, "Minimum disk is 200MB"),
        cpu: limits.shape.cpu.min(3, "Minimum cpu is 3% of a core"),
    }),
    version: z.string(),
});

export const changeRequest = z.object({
    name: userString,
    location,
    memory: z.number(),
    disk: z.number(),
    cpu: z.number(),
    version: z.string(),
}).partial();

export const metaLimit = limits.extend({
    slots: z.number(),
});

export const storeItems = z.enum(["memory", "disk", "cpu", "slots"]);

export const meta = z.object({
    _id: z.string(),
    owner: z.string(),
    coins: z.number(),
    limits: metaLimit,
    used: metaLimit,
    pricing: z.record(
        storeItems,
        z.object({
            price: z.number(),
            amount: z.number(),
        }),
    ),
});

export const bugReport = z.object({
    type: z.literal("web-frontend"),
    error: z.string(),
    errorStack: z.string(),
    platform: z.string().optional(),
    platformVersion: z.string().optional(),
    browserVersion: z.string().optional(),
    browser: z.string().optional(),
    userId: z.string().optional(),
    location: z.string(),
});

export const transcript = z.object({
    messages: z.object({
        author: z.string(),
        authorid: z.string(),
        content: z.string(),
        timestamp: z.string(),
        avatar: z.string(),
        attachments: z.array(z.string()).optional(),
        embeds: z.array(z.any()).optional(),
    }).array(),
    closed: z.string(),
    with: z.string(),
    _id: z.string(),
});

export const installedAddon = z.object({
    projectId: z.string(),
    versionId: z.string(),
});

export const sidecarRequest = z.discriminatedUnion("type", [
    z.object({
        type: z.literal("list"),
        path: z.string(),
    }),
    z.object({
        type: z.literal("read"),
        path: z.string(),
    }),
    z.object({
        type: z.literal("next-chunk"),
        path: z.string(),
    }),
    z.object({
        type: z.literal("install-addons"),
        addons: installedAddon.array(),
    }),
    z.object({
        type: z.literal("installed-addons"),
    }),
    z.object({
        type: z.literal("uninstall-addon"),
        projectId: z.string(),
    }),
    z.object({
        type: z.literal("write"),
        path: z.string(),
        chunk: z.string().optional(),
    }),
    z.object({
        type: z.literal("command"),
        command: z.string(),
    }),
    z.object({
        type: z.literal("delete"),
        path: z.string(),
    }),
    z.object({
        type: z.literal("state"),
        state: serverPowerActions,
    }),
    z.object({
        type: z.literal("tree"),
        path: z.string(),
    }),
]);

const addon = z.object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    downloads: z.number(),
    lastUpdated: z.string(),
    icon: z.string(),
    background: z.string(),
});

export const sidecarFile = z.object({
    name: z.string(),
    canWrite: z.boolean(),
    isFile: z.boolean(),
    fileMimeType: z.string().optional(),
    lastModified: z.number().optional(),
    size: z.number().optional(),
});

export const sidecarResponse = z.discriminatedUnion("type", [
    z.object({
        type: z.literal("list"),
        path: z.string(),
        canWrite: z.boolean(),
        list: sidecarFile.array(),
    }),
    z.object({
        type: z.literal("read"),
        path: z.string(),
        chunk: z.string().optional(),
        finish: z.boolean().optional(),
    }),
    z.object({
        type: z.literal("log"),
        chunk: z.string(),
        backlog: z.boolean().optional(),
    }),
    z.object({
        type: z.literal("error"),
        error: z.string(),
        path: z.string().optional(),
    }),
    z.object({
        type: z.literal("next-chunk"),
        path: z.string(),
    }),
    z.object({
        type: z.literal("state"),
        state: serverPowerState,
    }),
    z.object({
        type: z.literal("stats"),
        stats: z.object({
            cpu: z.number(),
            memory: z.number(),
            disk: z.number(),
        }),
    }),
    z.object({
        type: z.literal("install-addons"),
        success: z.boolean(),
    }),
    z.object({
        type: z.literal("installed-addons"),
        addons: z.object({
            addon: installedAddon,
            dependencies: installedAddon.array(),
        }).array(),
    }),
    z.object({
        type: z.literal("uninstall-addon"),
        success: z.boolean(),
    }),
    z.object({
        type: z.literal("tree"),
        path: z.string(),
        canWrite: z.boolean(),
        files: sidecarFile.array(),
    }),
]);

export const requestPayoutResponse = z.discriminatedUnion("type", [
    z.object({
        type: z.literal("createAccount"),
        url: z.string(),
    }),
    z.object({
        type: z.literal("needDetails"),
        missingDetails: z.array(z.string()),
        url: z.string(),
    }),
    z.object({
        type: z.literal("success"),
    }),
]);

export enum AuditTypes {
    StorePurchase = "store-purchase",
    ServerCreate = "server-create",
    ServerPowerChange = "server-power-change",
    ServerModify = "server-modify",
    ServerDelete = "server-delete",
    FileUpload = "file-upload",
    FileDelete = "file-delete",
    FileRead = "file-read",
    CommandExecute = "command-execute",
    ResetPassword = "reset-password",
    DropReview = "drop-review",
    DropTypeChange = "drop-type-change",
    DropCreate = "drop-create",
    OAuthValidate = "oauth-validate",
    OAuthAuthorize = "oauth-authorize",
    WebAuthNSignIn = "web-authn-sign-in",
    WebAuthNSignUp = "web-authn-sign-up",
    PasswordSignIn = "password-sign-in",
    PasswordSignUp = "password-sign-up",
    OAuthSignIn = "oauth-sign-in",
    OAuthSignUp = "oauth-sign-up",
}

export const audit = z.discriminatedUnion("action", [
    z.object({
        action: z.literal(AuditTypes.StorePurchase),
        user: z.string(),
        type: z.enum(["memory", "disk", "cpu", "slots"]),
    }),
    z.object({
        action: z.literal(AuditTypes.ServerCreate),
        user: z.string(),
        serverId: z.string(),
        data: z.any(),
    }),
    z.object({
        action: z.literal(AuditTypes.ServerPowerChange),
        user: z.string(),
        server: z.string(),
        power: serverPowerActions,
    }),
    z.object({
        action: z.literal(AuditTypes.ServerModify),
        user: z.string(),
        serverId: z.string(),
        changes: z.object({
            name: z.string(),
            location: z.string(),
            limits,
            state: serverPowerState,
            ports: z.number().array(),
            labels: z.enum(["suspended", "contact-support"]).array(),
        }).partial(),
    }),
    z.object({
        action: z.literal(AuditTypes.ServerDelete),
        user: z.string(),
        serverId: z.string(),
    }),
    z.object({
        action: z.literal(AuditTypes.FileUpload),
        user: z.string(),
        file: z.string(),
    }),
    z.object({
        action: z.literal(AuditTypes.FileDelete),
        user: z.string(),
        file: z.string(),
    }),
    z.object({
        action: z.literal(AuditTypes.FileRead),
        user: z.string(),
        file: z.string(),
    }),
    z.object({
        action: z.literal(AuditTypes.CommandExecute),
        user: z.string(),
        server: z.string(),
        command: z.string(),
    }),
    z.object({
        action: z.literal(AuditTypes.ResetPassword),
    }),
    z.object({
        action: z.literal(AuditTypes.DropReview),
        dropId: z.string(),
    }),
    z.object({
        action: z.literal(AuditTypes.DropTypeChange),
        dropId: z.string(),
        type: z.nativeEnum(DropType),
    }),
    z.object({
        action: z.literal(AuditTypes.DropCreate),
        dropId: z.string(),
    }),
    z.object({
        action: z.literal(AuditTypes.OAuthValidate),
        appId: z.string(),
        scopes: z.array(z.string()),
    }),
    z.object({
        action: z.literal(AuditTypes.OAuthAuthorize),
        appId: z.string(),
        scopes: z.array(z.string()),
    }),
    z.object({
        action: z.literal(AuditTypes.WebAuthNSignIn),
    }),
    z.object({
        action: z.literal(AuditTypes.WebAuthNSignUp),
    }),
    z.object({
        action: z.literal(AuditTypes.PasswordSignIn),
    }),
    z.object({
        action: z.literal(AuditTypes.PasswordSignUp),
    }),
    z.object({
        action: z.literal(AuditTypes.OAuthSignIn),
        provider: z.string(),
    }),
    z.object({
        action: z.literal(AuditTypes.OAuthSignUp),
        provider: z.string(),
    }),
]);

export const serverAudit = z.object({
    id: z.string(),
    _id: z.string().optional(), // Remove after some time
    meta: audit,
    user: z.object({
        profile: z.object({
            username: z.string(),
            avatar: z.string(),
        }),
    }),
});

export enum OAuthScopes {
    Profile = "profile",
    Email = "email",
    Phone = "phone",
}

export const group = z.object({
    displayName: z.string(),
    _id: z.string(), // Replace with id
    permission: z.string(),
});

export interface Deferred<T> {
    promise: Promise<T>;
    resolve(value?: T | PromiseLike<T>): void;
    // deno-lint-ignore no-explicit-any
    reject(reason?: any): void;
}

export type InstalledAddon = z.infer<typeof installedAddon>;
export type Group = z.infer<typeof group>;
export type Audit = z.infer<typeof audit>;
export type ServerAudit = z.infer<typeof serverAudit>;
export type RequestPayoutResponse = z.infer<typeof requestPayoutResponse>;
export type SidecarResponse = z.infer<typeof sidecarResponse>;
export type Addon = z.infer<typeof addon>;
export type SidecarRequest = z.infer<typeof sidecarRequest>;
export type ArtistRef = z.infer<typeof artistref>;
export type Artist = z.infer<typeof artist>;
export type BugReport = z.infer<typeof bugReport>;
export type Drop = z.infer<typeof drop>;
export type File = z.infer<typeof file>;
export type Location = z.infer<typeof location>;
export type Meta = z.infer<typeof meta>;
export type OAuthApp = z.infer<typeof oauthapp>;
export type Payout = z.infer<typeof payout>;
export type PowerState = z.infer<typeof serverPowerState>;
export type PowerAction = z.infer<typeof serverPowerActions>;
export type Server = z.infer<typeof server>;
export type ServerCreate = z.infer<typeof serverCreate>;
export type Song = z.infer<typeof song>;
export type StoreItems = z.infer<typeof storeItems>;
export type Transcript = z.infer<typeof transcript>;
export type Wallet = z.infer<typeof wallet>;
export type SidecarFile = z.infer<typeof sidecarFile>;
export type Share = z.infer<typeof share>;
