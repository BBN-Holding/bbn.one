import { State, UploadFilesDialog } from "webgen/mod.ts";
import { API } from "../manager/RESTSpec.ts";
import { state } from "./state.ts";
import { StreamingUploadHandler } from "../manager/upload.ts";
import { delay } from "https://deno.land/std@0.182.0/async/delay.ts";

export async function refreshState() {
    state.reviews = State(await API.music(API.getToken()).reviews.get());
    state.users = State(await API.user(API.getToken()).list.get());
    state.payouts = State(await API.payment(API.getToken()).payouts.get());
}


export function upload(type: "isrc" | "manual") {
    if (type == "manual") {
        UploadFilesDialog((list) => {
            console.log(list);
            StreamingUploadHandler(`payment/payout/upload`, {
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
                },
                onUploadTick: async (percentage) => {
                    console.log(percentage);
                    await delay(2);
                }
            }, list[ 0 ].file);
        }, '.xlsx');
    } else {
        UploadFilesDialog((list) => {
            console.log(list);
            StreamingUploadHandler(`payment/payout/isrcsync`, {
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
                },
                onUploadTick: async (percentage) => {
                    console.log(percentage);
                    await delay(2);
                }
            }, list[ 0 ].file);
        }, '.xlsx');
    }
}