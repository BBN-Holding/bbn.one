import { AuditTypes, Server } from "../../../spec/music.ts";

export const labels = {
    legacy: "Legacy",
    suspended: "Suspended",
    "contact-support": "Contact Support"
} satisfies Record<Server[ "labels" ][ number ], string>;

export const auditLabels = {
    "server-create": "Server Created",
    "server-delete": "Server Deleted",
    "server-modify": "Server Specs Updated",
    "server-power-change": "Power changed to $powerChange",
    "store-purchase": "Purchased $storeItem in store",
    "file-upload": "File Uploaded",
    "file-delete": "File Deleted",
    "file-read": "File Read",
    "command-execute": "Command Executed",
} satisfies Record<AuditTypes, string>;
