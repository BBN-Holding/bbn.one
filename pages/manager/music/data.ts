import { delay } from "https://deno.land/std@0.167.0/async/delay.ts";
import { AdvancedImage, StateHandler } from "webgen/mod.ts";
import { Drop } from "../../../spec/music.ts";
import { API } from "../RESTSpec.ts";
import { StreamingUploadHandler } from "../upload.ts";

export function uploadSongToDrop(state: StateHandler<{ uploadingSongs: string[]; songs: Drop[ "songs" ]; }>, drop: Drop, source: File[]) {
    for (const file of source) {
        const uploadId = crypto.randomUUID();
        state.uploadingSongs.push(uploadId);
        if (!state.songs)
            state.songs = [];
        const cleanedUpTitle = file.name
            .replaceAll("_", " ")
            .replaceAll("-", " ")
            .replace(/\.[^/.]+$/, "");

        state.songs = [ ...state.songs, {
            id: uploadId,
            title: cleanedUpTitle,
            artists: drop.artists ?? [],
            // TODO: country should be real country
            country: drop.language!,
            explicit: false,
            primaryGenre: drop.primaryGenre!,
            secondaryGenre: drop.secondaryGenre!,
            year: new Date().getFullYear(),
            progress: 0,
            file: undefined!
        } ];

        StreamingUploadHandler(`music/${drop._id}/upload`, {
            failure: () => {
                state.uploadingSongs = <StateHandler<string[]>>state.uploadingSongs.filter(x => x != uploadId);
                if (state.songs)
                    state.songs[ state.songs.findIndex(x => x.id == uploadId) ].progress = -1;
                state.songs = [ ...state.songs ?? [] ];
                alert("Your Upload has failed. Please try a different file or try again later");
            },
            uploadDone: () => {
                if (state.songs)
                    state.songs[ state.songs.findIndex(x => x.id == uploadId) ].progress = 100;
                state.songs = [ ...state.songs ?? [] ];
            },
            credentials: () => API.getToken(),
            backendResponse: (id) => {
                if (state.songs) {
                    state.songs[ state.songs.findIndex(x => x.id == uploadId) ].progress = undefined;
                    state.songs[ state.songs.findIndex(x => x.id == uploadId) ].file = id;
                }
                state.uploadingSongs = <StateHandler<string[]>>state.uploadingSongs.filter(x => x != uploadId);
                state.songs = [ ...state.songs ?? [] ];
            },
            // deno-lint-ignore require-await
            onUploadTick: async (percentage) => {
                if (state.songs)
                    state.songs[ state.songs.findIndex(x => x.id == uploadId) ].progress = percentage;
                state.songs = [ ...state.songs ?? [] ];
            }
        }, file);
    }
}

export function uploadArtwork(state: StateHandler<{ artworkClientData: AdvancedImage | string | undefined; loading: boolean; artwork: string | undefined; }>, file: File) {
    const params = new URLSearchParams(location.search);
    const blobUrl = URL.createObjectURL(file);
    state.artworkClientData = <AdvancedImage>{ type: "uploading", filename: file.name, blobUrl, percentage: 0 };
    state.loading = true;

    setTimeout(() => {
        StreamingUploadHandler(`music/${params.get("id")!}/upload`, {
            failure: () => {
                state.loading = false;
                state.artworkClientData = undefined;
                alert("Your Upload has failed. Please try a different file or try again later");
            },
            uploadDone: () => {
                state.artworkClientData = <AdvancedImage>{ type: "waiting-upload", filename: file.name, blobUrl };
            },
            credentials: () => API.getToken(),
            backendResponse: (id) => {
                state.artworkClientData = blobUrl;
                state.artwork = id;
                state.loading = false;
            },
            onUploadTick: async (percentage) => {
                state.artworkClientData = <AdvancedImage>{ type: "uploading", filename: file.name, blobUrl, percentage };
                await delay(2);
            }
        }, file);
    });
}