import { AuditTypes, Server } from "../../spec/music.ts";

export const labels = {
    suspended: "Suspended",
    "contact-support": "Contact Support",
    maintenance: "Maintenance",
    disabled: "Disabled",
} satisfies Record<Server["labels"][number], string>;

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
    "reset-password": "Reset Password",
    "drop-review": "Drop Review",
    "drop-type-change": "Drop Type Change",
    "drop-create": "Drop Created",
    "oauth-validate": "OAuth Validation",
    "oauth-authorize": "OAuth Authorization",
} satisfies Record<AuditTypes, string>;
