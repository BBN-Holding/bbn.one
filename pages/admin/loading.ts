import { API, StreamingUploadHandler } from "shared";
import { delay } from "std/async/delay.ts";
import { UploadFilesDialog } from "webgen/mod.ts";
import { state } from "./state.ts";

export async function refreshState() {
    await Promise.all([
        (async () => state.reviews = await API.admin(API.getToken()).reviews.get())(),
        (async () => state.users = await API.user(API.getToken()).list.get())(),
        (async () => state.payouts = await API.admin(API.getToken()).payouts.get())(),
        (async () => state.files = await API.admin(API.getToken()).files.list())(),
        (async () => state.servers = await API.admin(API.getToken()).servers.get())(),
        (async () => state.wallets = await API.admin(API.getToken()).wallets.list())(),
        (async () => state.oauth = await API.oauth(API.getToken()).list())()
    ]);
}

const urls = {
    "isrc": [ "admin/payout/isrcsync", '.xlsx' ],
    "manual": [ "admin/payouts/upload", '.xlsx' ],
    "oauth": [ "oauth/applications/upload", 'image/*' ]
};
export function upload(type: keyof typeof urls): Promise<string> {
    const [ url, extension ] = urls[ type ];
    return new Promise(resolve => {
        UploadFilesDialog((list) => {
            StreamingUploadHandler(url, {
                failure: () => {
                    alert("Your Upload has failed. Please try a different file or try again later");
                },
                uploadDone: () => {
                    console.log("Upload done");
                },
                credentials: () => API.getToken(),
                backendResponse: (id) => {
                    resolve(id);
                },
                onUploadTick: async (percentage) => {
                    console.log(percentage);
                    await delay(2);
                }
            }, list[ 0 ].file);
        }, extension);
    });
}