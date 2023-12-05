import { API, StreamingUploadHandler } from "shared/mod.ts";
import { delay } from "std/async/delay.ts";
import { UploadFilesDialog } from "webgen/mod.ts";
import { DropType } from "../../spec/music.ts";
import { state } from "./state.ts";

export async function refreshState() {
    await Promise.all([
        (async () => state.drops.reviews = await API.admin.drops.list(DropType.UnderReview))(),
        (async () => state.drops.publishing = await API.admin.drops.list(DropType.Publishing))(),
        (async () => state.drops.published = await API.admin.drops.list(DropType.Published))(),
        (async () => state.drops.private = await API.admin.drops.list(DropType.Private))(),
        (async () => state.drops.rejected = await API.admin.drops.list(DropType.ReviewDeclined))(),
        (async () => state.drops.drafts = await API.admin.drops.list(DropType.Unsubmitted))(),
        (async () => state.users = await API.admin.users.list())(),
        (async () => state.groups = await API.admin.groups.list())(),
        (async () => state.payouts = await API.admin.payouts.list())(),
        (async () => state.files = await API.admin.files.list())(),
        (async () => state.servers = await API.admin.servers.list())(),
        (async () => state.wallets = await API.admin.wallets.list())(),
        (async () => state.oauth = await API.oauth.list())(),
        (async () => state.transcripts = await API.admin.transcripts.list())(),
        (async () => state.stats = await API.admin.stats())()
    ]);
}

const urls = {
    "isrc": [ "admin/drops/upload", '.xlsx' ],
    "manual": [ "admin/payouts/upload", '.xlsx' ],
    "oauth": [ "oauth/applications/upload", 'image/*' ]
};
export function upload(type: keyof typeof urls): Promise<string> {
    const [ url, extension ] = urls[ type ];
    return new Promise(resolve => {
        UploadFilesDialog((list) => {
            StreamingUploadHandler(url, {
                failure: () => alert("Your Upload has failed. Please try a different file or try again later"),
                uploadDone: () => console.log("Upload done"),
                credentials: () => API.getToken(),
                backendResponse: (id) => resolve(id),
                onUploadTick: async () => await delay(2)
            }, list[ 0 ].file);
        }, extension);
    });
}