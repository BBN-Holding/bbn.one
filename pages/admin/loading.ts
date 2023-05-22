import { API, StreamingUploadHandler } from "shared";
import { delay } from "std/async/delay.ts";
import { State, UploadFilesDialog } from "webgen/mod.ts";
import { state } from "./state.ts";

export async function refreshState() {

    await Promise.all([
        (async () => state.reviews = State(await API.admin(API.getToken()).reviews.get()))(),
        (async () => state.users = State(await API.user(API.getToken()).list.get()))(),
        (async () => state.payouts = State(await API.admin(API.getToken()).payouts.get()))(),
        (async () => state.oauth = State(await API.oauth(API.getToken()).list()))(),
        (async () => state.files = State(await API.admin(API.getToken()).files.list()))(),
        (async () => state.servers = State(await API.admin(API.getToken()).servers.get()))()
    ]);
}

const urls = {
    "isrc": [ "payment/payout/isrcsync", '.xlsx' ],
    "manual": [ "payment/payouts/upload", '.xlsx' ],
    "oauth": [ "oauth/applications/upload", 'image/*' ]
};
export function upload(type: keyof typeof urls): Promise<string> {
    const [ url, extension ] = urls[ type ];
    return new Promise(resolve => {
        UploadFilesDialog((list) => {
            StreamingUploadHandler(url, {
                failure: () => {
                    //state.loading = false;
                    alert("Your Upload has failed. Please try a different file or try again later");
                },
                uploadDone: () => {
                    console.log("Upload done");
                },
                credentials: () => API.getToken(),
                backendResponse: (id) => {
                    console.log(id);
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