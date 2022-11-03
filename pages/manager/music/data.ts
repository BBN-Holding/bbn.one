import { delay } from "https://deno.land/std@0.140.0/async/delay.ts";
import { Component, Custom, img } from "webgen/mod.ts";
import { API, Drop } from "../RESTSpec.ts";
import { StreamingUploadHandler } from "../upload.ts";

const lockedLoading = new Set();
export function addSongsByDrop(drop: Drop, list: File[], formData: FormData, update: (data: Partial<unknown>) => void) {
    list.map(x => ({ file: x, id: crypto.randomUUID() })).forEach(({ file, id }) => {
        formData.append("song", id);
        formData.set("loading", "-");

        lockedLoading.add(id);
        const cleanedUpTitle = file.name
            .replaceAll("_", " ")
            .replaceAll("-", " ")
            .replace(/\.[^/.]+$/, "");

        StreamingUploadHandler(`music/${drop._id}/upload`, {
            failure: () => {
                formData.set(`song-${id}-error`, "upload-failure");
                lockedLoading.delete(id);
                if (lockedLoading.size == 0)
                    formData.delete("loading");
                alert("Your Upload has failed. Please try a different file or try again later");
                update({});
            },
            prepare: () => {
                formData.set(`song-${id}-progress`, "0");
            },
            credentials: () => API.getToken(),
            backendResponse: (fileId) => {
                formData.set(`song-${id}-file`, fileId);
                formData.delete(`song-${id}-progress`);
                lockedLoading.delete(id);
                if (lockedLoading.size == 0)
                    formData.delete("loading");
                update({});
            },
            onUploadTick: async (percentage) => {
                formData.set(`song-${id}-progress`, percentage.toString());
                await delay(10);
                update({});
            },
            uploadDone: () => {

            }
        }, file);
        formData.set(`song-${id}-title`, cleanedUpTitle); // Our AI prediceted name
        formData.set(`song-${id}-year`, new Date().getFullYear().toString());
        formData.set(`song-${id}-artists`, JSON.stringify(drop.artists ?? "[]"));
        if (drop.primaryGenre)
            formData.set(`song-${id}-primaryGenre`, drop.primaryGenre);
        if (drop.secondaryGenre)
            formData.set(`song-${id}-secondaryGenre`, drop.secondaryGenre);
        if (drop.language)
            formData.set(`song-${id}-country`, drop.language);
    });
    update({});
}
export function addSongs(dropId: string, meta: () => FormData[], list: File[], formData: FormData, update: (data: Partial<unknown>) => void) {
    list.map(x => ({ file: x, id: crypto.randomUUID() })).forEach(({ file, id }) => {
        formData.append("song", id);
        formData.set("loading", "-");

        lockedLoading.add(id);
        const cleanedUpTitle = file.name
            .replaceAll("_", " ")
            .replaceAll("-", " ")
            .replace(/\.[^/.]+$/, "");

        StreamingUploadHandler(`music/${dropId}/upload`, {
            failure: () => {
                formData.set(`song-${id}-error`, "upload-failure");
                lockedLoading.delete(id);
                if (lockedLoading.size == 0)
                    formData.delete("loading");
                alert("Your Upload has failed. Please try a different file or try again later");
                update({});
            },
            prepare: () => {
                formData.set(`song-${id}-progress`, "0");
            },
            credentials: () => API.getToken(),
            backendResponse: (fileId) => {
                formData.set(`song-${id}-file`, fileId);
                formData.delete(`song-${id}-progress`);
                lockedLoading.delete(id);
                if (lockedLoading.size == 0)
                    formData.delete("loading");
                update({});
            },
            onUploadTick: async (percentage) => {
                formData.set(`song-${id}-progress`, percentage.toString());
                await delay(10);
                update({});
            },
            uploadDone: () => {

            }
        }, file);
        formData.set(`song-${id}-title`, cleanedUpTitle); // Our AI prediceted name
        formData.set(`song-${id}-year`, new Date().getFullYear().toString());
        const list = meta();
        applyFromPage(list, formData, 1, "artists", `song-${id}-artists`);
        applyFromPage(list, formData, 1, "primaryGenre", `song-${id}-primaryGenre`);
        applyFromPage(list, formData, 1, "secondaryGenre", `song-${id}-secondaryGenre`);
        applyFromPage(list, formData, 1, "language", `song-${id}-country`);
    });
    update({});
}

function applyFromPage(meta: FormData[], current: FormData, index: number, src: string, dest: string) {
    if (meta[ index ]?.has(src))
        current.set(dest, meta[ index ].get(src)!.toString());
}

export function ImageFrom(formData: FormData, key: string): Component {
    return Custom(img(formData.get(key)! as string));
}
