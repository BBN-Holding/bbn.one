import { sumOf } from "@std/collections";
import { zod } from "webgen/zod.ts";

export const DATE_PATTERN = /\d\d\d\d-\d\d-\d\d/;
export const userString = zod.string().min(1).transform((x) => x.trim());

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

export const artist = zod.object({
    _id: zod.string(),
    name: userString,
    users: zod.string().array(),
    avatar: zod.string().optional(),
    spotify: zod.string().optional(),
    apple: zod.string().optional(),
});

export const artistref = zod.object({
    _id: zod.string(),
    type: zod.literal(ArtistTypes.Primary).or(zod.literal(ArtistTypes.Featuring)),
}).or(zod.object({
    name: userString,
    type: zod.literal(ArtistTypes.Producer).or(zod.literal(ArtistTypes.Songwriter)),
}));

export const share = zod.object({
    _id: zod.string(),
    drop: zod.string(),
    slug: zod.string(),
    services: zod.record(zod.string()),
});

export const song = zod.object({
    _id: zod.string(),
    user: zod.string().optional(),
    isrc: zod.string().optional(),
    title: userString,
    artists: artistref.array().refine((x) => x.some(({ type }) => type == "PRIMARY"), { message: "At least one primary artist is required" }).refine((x) => x.some(({ type }) => type == "SONGWRITER"), { message: "At least one songwriter is required" }),
    primaryGenre: zod.string(),
    secondaryGenre: zod.string(),
    year: zod.number(),
    //add in frontend with additional info sheet
    country: zod.string().optional(),
    language: zod.string(),
    explicit: zod.boolean(),
    instrumental: zod.boolean(),
    file: zod.string({ required_error: "a Song is missing its file." }),
});

export const pureDrop = zod.object({
    gtin: zod.string()
        .trim()
        .min(12, { message: "UPC/EAN: Invalid length" })
        .max(13, { message: "UPC/EAN: Invalid length" })
        .regex(/^\d+$/, { message: "UPC/EAN: Not a number" })
        .refine((gtin) => parseInt(gtin.slice(-1), 10) === (10 - (sumOf(gtin.slice(0, -1).split("").map((digit, index) => parseInt(digit, 10) * ((16 - gtin.length + index) % 2 === 0 ? 3 : 1)), (x) => x) % 10)) % 10, {
            message: "UPC/EAN: Invalid",
        }).optional(),
    title: userString,
    artists: artistref.array().refine((x) => x.some(({ type }) => type == "PRIMARY"), { message: "At least one primary artist is required" }).refine((x) => x.some(({ type }) => type == "SONGWRITER"), { message: "At least one songwriter is required" }),
    release: zod.string().regex(DATE_PATTERN, { message: "Not a date" }),
    language: zod.string(),
    primaryGenre: zod.string(),
    secondaryGenre: zod.string(),
    compositionCopyright: userString,
    soundRecordingCopyright: userString,
    artwork: zod.string(),
    songs: zod.string().array().min(1),
    comments: userString.optional(),
});

export const drop = pureDrop
    .merge(zod.object({
        _id: zod.string(),
        user: zod.string(),
        type: zod.nativeEnum(DropType),
    }));

const pageOne = zod.object({
    title: userString,
    artists: artistref.array().refine((x) => x.some(({ type }) => type == "PRIMARY"), { message: "At least one primary artist is required" }).refine((x) => x.some(({ type }) => type == "SONGWRITER"), { message: "At least one songwriter is required" }),
    release: zod.string().regex(DATE_PATTERN, { message: "Not a date" }),
    language: zod.string(),
    primaryGenre: zod.string(),
    secondaryGenre: zod.string(),
    gtin: zod.preprocess(
        (x) => x === "" ? undefined : x,
        zod.string().trim()
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

const pageTwo = zod.object({
    artwork: zod.string(),
    artworkClientData: zod.object({
        type: zod.string().refine((x) => x !== "uploading", { message: "Artwork is still uploading" }),
    }).transform(() => undefined),
});

const pageThree = zod.object({
    songs: song.array().min(1, { message: "At least one song is required" }).refine((songs) => songs.every(({ instrumental, explicit }) => !(instrumental && explicit)), "Can't have an explicit instrumental song"),
    uploadingSongs: zod.array(zod.string()).max(0, { message: "Some uploads are still in progress" }),
});

export const pages = <zod.AnyZodObject[]> [pageOne, pageTwo, pageThree];

export const payout = zod.object({
    _id: zod.string(),
    file: zod.string(),
    period: zod.string(),
    entries: zod.object({
        isrc: zod.string(),
        data: zod.array(
            zod.object({
                store: zod.string(),
                territory: zod.string(),
                quantity: zod.number(),
                revenue: zod.number(),
            }),
        ),
    }).array(),
    user: zod.string(),
});

export const oauthapp = zod.object({
    _id: zod.string(),
    name: userString,
    redirect: zod.string().url().array(),
    secret: zod.string(),
    icon: zod.string(),
});

export const file = zod.object({
    _id: zod.string(),
    length: zod.number(),
    chunkSize: zod.number(),
    uploadDate: zod.string(),
    filename: zod.string(),
    metadata: zod.object({
        type: zod.string(),
    }),
});

export enum PaymentType {
    Restrained = "RESTRAINED", // cannot be withdrawn (when adding funds to account)
    Unrestrained = "UNRESTRAINED", // can be withdrawn
}

export const wallet = zod.object({
    _id: zod.string(),
    transactions: zod.object({
        amount: zod.number(), // positive for incoming, negative for outgoing
        timestamp: zod.string(),
        type: zod.nativeEnum(PaymentType),
        description: zod.string(),
        counterParty: zod.string(),
    }).array(),
    cut: zod.number(),
    user: zod.string(),
    userName: zod.string().optional(),
    email: zod.string().optional(),
    balance: zod.object({
        restrained: zod.number(),
        unrestrained: zod.number(),
    }).optional(),
    stripeAccountId: zod.string().optional(),
});

export const limits = zod.object({
    memory: zod.number(),
    disk: zod.number(),
    cpu: zod.number(),
});

export enum ServerTypes {
    Vanilla = "/minecraft/vanilla/",
    Default = "/minecraft/default/",
    Fabric = "/minecraft/modded/fabric/",
    Forge = "/minecraft/modded/forge/",
    Bedrock = "/minecraft/bedrock/",
    PocketMine = "/minecraft/pocketmine/",
}

export const serverPowerState = zod.enum(["starting", "installing", "stopping", "running", "offline"]);
export const serverPowerActions = zod.enum(["start", "stop", "kill"]);

export const location = zod.enum(["bbn-fsn", "bbn-hel", "bbn-mum", "bbn-sgp"]);
export const serverLabels = zod.enum([
    "suspended",
    "contact-support",
    "maintenance",
    "disabled",
]);

export const server = zod.object({
    _id: zod.string(),
    name: zod.string().max(30),
    type: zod.nativeEnum(ServerTypes),
    location,
    limits,
    state: serverPowerState,
    address: zod.string().optional(),
    ports: zod.number().array(),
    user: zod.string(),
    stateSince: zod.number().describe("unix timestamp"),
    labels: serverLabels.array(),
    version: zod.string(),
});

export const serverCreate = zod.object({
    name: zod.string().min(3).max(20),
    type: zod.nativeEnum(ServerTypes),
    location,
    limits: zod.object({
        memory: limits.shape.memory.min(300, "Minimum memory is 300MB"),
        disk: limits.shape.disk.min(200, "Minimum disk is 200MB"),
        cpu: limits.shape.cpu.min(3, "Minimum cpu is 3% of a core"),
    }),
    version: zod.string(),
});

export const changeRequest = zod.object({
    name: userString,
    location,
    memory: zod.number(),
    disk: zod.number(),
    cpu: zod.number(),
    version: zod.string(),
}).partial();

export const metaLimit = limits.extend({
    slots: zod.number(),
});

export const storeItems = zod.enum(["memory", "disk", "cpu", "slots"]);

export const meta = zod.object({
    _id: zod.string(),
    owner: zod.string(),
    coins: zod.number(),
    limits: metaLimit,
    used: metaLimit,
    pricing: zod.record(
        storeItems,
        zod.object({
            price: zod.number(),
            amount: zod.number(),
        }),
    ),
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
    location: zod.string(),
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

export const installedAddon = zod.object({
    projectId: zod.string(),
    versionId: zod.string(),
});

export const sidecarRequest = zod.discriminatedUnion("type", [
    zod.object({
        type: zod.literal("list"),
        path: zod.string(),
    }),
    zod.object({
        type: zod.literal("read"),
        path: zod.string(),
    }),
    zod.object({
        type: zod.literal("next-chunk"),
        path: zod.string(),
    }),
    zod.object({
        type: zod.literal("install-addons"),
        addons: installedAddon.array(),
    }),
    zod.object({
        type: zod.literal("installed-addons"),
    }),
    zod.object({
        type: zod.literal("uninstall-addon"),
        projectId: zod.string(),
    }),
    zod.object({
        type: zod.literal("write"),
        path: zod.string(),
        chunk: zod.string().optional(),
    }),
    zod.object({
        type: zod.literal("command"),
        command: zod.string(),
    }),
    zod.object({
        type: zod.literal("delete"),
        path: zod.string(),
    }),
    zod.object({
        type: zod.literal("state"),
        state: serverPowerActions,
    }),
    zod.object({
        type: zod.literal("tree"),
        path: zod.string(),
    }),
]);

const addon = zod.object({
    id: zod.string(),
    name: zod.string(),
    description: zod.string(),
    downloads: zod.number(),
    lastUpdated: zod.string(),
    icon: zod.string(),
    background: zod.string(),
});

export const sidecarFile = zod.object({
    name: zod.string(),
    canWrite: zod.boolean(),
    isFile: zod.boolean(),
    fileMimeType: zod.string().optional(),
    lastModified: zod.number().optional(),
    size: zod.number().optional(),
});

export const sidecarResponse = zod.discriminatedUnion("type", [
    zod.object({
        type: zod.literal("list"),
        path: zod.string(),
        canWrite: zod.boolean(),
        list: sidecarFile.array(),
    }),
    zod.object({
        type: zod.literal("read"),
        path: zod.string(),
        chunk: zod.string().optional(),
        finish: zod.boolean().optional(),
    }),
    zod.object({
        type: zod.literal("log"),
        chunk: zod.string(),
        backlog: zod.boolean().optional(),
    }),
    zod.object({
        type: zod.literal("error"),
        error: zod.string(),
        path: zod.string().optional(),
    }),
    zod.object({
        type: zod.literal("next-chunk"),
        path: zod.string(),
    }),
    zod.object({
        type: zod.literal("state"),
        state: serverPowerState,
    }),
    zod.object({
        type: zod.literal("stats"),
        stats: zod.object({
            cpu: zod.number(),
            memory: zod.number(),
            disk: zod.number(),
        }),
    }),
    zod.object({
        type: zod.literal("install-addons"),
        success: zod.boolean(),
    }),
    zod.object({
        type: zod.literal("installed-addons"),
        addons: zod.object({
            addon: installedAddon,
            dependencies: installedAddon.array(),
        }).array(),
    }),
    zod.object({
        type: zod.literal("uninstall-addon"),
        success: zod.boolean(),
    }),
    zod.object({
        type: zod.literal("tree"),
        path: zod.string(),
        canWrite: zod.boolean(),
        files: sidecarFile.array(),
    }),
]);

export const requestPayoutResponse = zod.discriminatedUnion("type", [
    zod.object({
        type: zod.literal("createAccount"),
        url: zod.string(),
    }),
    zod.object({
        type: zod.literal("needDetails"),
        missingDetails: zod.array(zod.string()),
        url: zod.string(),
    }),
    zod.object({
        type: zod.literal("success"),
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

export const audit = zod.discriminatedUnion("action", [
    zod.object({
        action: zod.literal(AuditTypes.StorePurchase),
        user: zod.string(),
        type: zod.enum(["memory", "disk", "cpu", "slots"]),
    }),
    zod.object({
        action: zod.literal(AuditTypes.ServerCreate),
        user: zod.string(),
        serverId: zod.string(),
        data: zod.any(),
    }),
    zod.object({
        action: zod.literal(AuditTypes.ServerPowerChange),
        user: zod.string(),
        server: zod.string(),
        power: serverPowerActions,
    }),
    zod.object({
        action: zod.literal(AuditTypes.ServerModify),
        user: zod.string(),
        serverId: zod.string(),
        changes: zod.object({
            name: zod.string(),
            location: zod.string(),
            limits,
            state: serverPowerState,
            ports: zod.number().array(),
            labels: zod.enum(["suspended", "contact-support"]).array(),
        }).partial(),
    }),
    zod.object({
        action: zod.literal(AuditTypes.ServerDelete),
        user: zod.string(),
        serverId: zod.string(),
    }),
    zod.object({
        action: zod.literal(AuditTypes.FileUpload),
        user: zod.string(),
        file: zod.string(),
    }),
    zod.object({
        action: zod.literal(AuditTypes.FileDelete),
        user: zod.string(),
        file: zod.string(),
    }),
    zod.object({
        action: zod.literal(AuditTypes.FileRead),
        user: zod.string(),
        file: zod.string(),
    }),
    zod.object({
        action: zod.literal(AuditTypes.CommandExecute),
        user: zod.string(),
        server: zod.string(),
        command: zod.string(),
    }),
    zod.object({
        action: zod.literal(AuditTypes.ResetPassword),
    }),
    zod.object({
        action: zod.literal(AuditTypes.DropReview),
        dropId: zod.string(),
    }),
    zod.object({
        action: zod.literal(AuditTypes.DropTypeChange),
        dropId: zod.string(),
        type: zod.nativeEnum(DropType),
    }),
    zod.object({
        action: zod.literal(AuditTypes.DropCreate),
        dropId: zod.string(),
    }),
    zod.object({
        action: zod.literal(AuditTypes.OAuthValidate),
        appId: zod.string(),
        scopes: zod.array(zod.string()),
    }),
    zod.object({
        action: zod.literal(AuditTypes.OAuthAuthorize),
        appId: zod.string(),
        scopes: zod.array(zod.string()),
    }),
    zod.object({
        action: zod.literal(AuditTypes.WebAuthNSignIn),
    }),
    zod.object({
        action: zod.literal(AuditTypes.WebAuthNSignUp),
    }),
    zod.object({
        action: zod.literal(AuditTypes.PasswordSignIn),
    }),
    zod.object({
        action: zod.literal(AuditTypes.PasswordSignUp),
    }),
    zod.object({
        action: zod.literal(AuditTypes.OAuthSignIn),
        provider: zod.string(),
    }),
    zod.object({
        action: zod.literal(AuditTypes.OAuthSignUp),
        provider: zod.string(),
    }),
]);

export const serverAudit = zod.object({
    id: zod.string(),
    _id: zod.string().optional(), // Remove after some time
    meta: audit,
    user: zod.object({
        profile: zod.object({
            username: zod.string(),
            avatar: zod.string(),
        }),
    }),
});

export enum OAuthScopes {
    Profile = "profile",
    Email = "email",
    Phone = "phone",
}

export const group = zod.object({
    displayName: zod.string(),
    _id: zod.string(), // Replace with id
    permission: zod.string(),
});

export interface Deferred<T> {
    promise: Promise<T>;
    resolve(value?: T | PromiseLike<T>): void;
    // deno-lint-ignore no-explicit-any
    reject(reason?: any): void;
}

export type InstalledAddon = zod.infer<typeof installedAddon>;
export type Group = zod.infer<typeof group>;
export type Audit = zod.infer<typeof audit>;
export type ServerAudit = zod.infer<typeof serverAudit>;
export type RequestPayoutResponse = zod.infer<typeof requestPayoutResponse>;
export type SidecarResponse = zod.infer<typeof sidecarResponse>;
export type Addon = zod.infer<typeof addon>;
export type SidecarRequest = zod.infer<typeof sidecarRequest>;
export type ArtistRef = zod.infer<typeof artistref>;
export type Artist = zod.infer<typeof artist>;
export type BugReport = zod.infer<typeof bugReport>;
export type Drop = zod.infer<typeof drop>;
export type File = zod.infer<typeof file>;
export type Location = zod.infer<typeof location>;
export type Meta = zod.infer<typeof meta>;
export type OAuthApp = zod.infer<typeof oauthapp>;
export type Payout = zod.infer<typeof payout>;
export type PowerState = zod.infer<typeof serverPowerState>;
export type PowerAction = zod.infer<typeof serverPowerActions>;
export type Server = zod.infer<typeof server>;
export type ServerCreate = zod.infer<typeof serverCreate>;
export type Song = zod.infer<typeof song>;
export type StoreItems = zod.infer<typeof storeItems>;
export type Transcript = zod.infer<typeof transcript>;
export type Wallet = zod.infer<typeof wallet>;
export type SidecarFile = zod.infer<typeof sidecarFile>;
export type Share = zod.infer<typeof share>;
