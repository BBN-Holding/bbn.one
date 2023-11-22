import { API, StreamingUploadHandler } from "shared/mod.ts";
import { delay } from "std/async/delay.ts";
import { AdvancedImage, State, StateHandler } from "webgen/mod.ts";
import { Drop } from "../../../spec/music.ts";

// TODO: Remove all theses spread operator, update values directly,

export function uploadSongToDrop(state: StateHandler<{ uploadingSongs: string[]; songs: Drop[ "songs" ]; }>, drop: Drop, source: File[]) {
    for (const file of source) {
        const uploadId = crypto.randomUUID();
        state.uploadingSongs.push(uploadId);
        if (!state.songs)
            state.songs = State([]);
        const cleanedUpTitle = file.name
            .replaceAll("_", " ")
            .replaceAll("-", " ")
            .replace(/\.[^/.]+$/, "");

        state.songs = State([ ...state.songs, {
            id: uploadId,
            title: cleanedUpTitle,
            artists: drop.artists ?? [],
            // TODO: country should be real country
            country: drop.language!,
            instrumental: false,
            explicit: false,
            primaryGenre: drop.primaryGenre!,
            secondaryGenre: drop.secondaryGenre!,
            year: new Date().getFullYear(),
            progress: 0,
            file: undefined!
        } ] as Drop[ "songs" ]);

        StreamingUploadHandler(`music/drops/${drop._id}/upload`, {
            failure: () => {
                state.uploadingSongs = <StateHandler<string[]>>state.uploadingSongs.filter(x => x != uploadId);
                if (state.songs)
                    state.songs[ state.songs.findIndex(x => x.id == uploadId) ].progress = -1;
                state.songs = State([ ...state.songs ?? [] ] as Drop[ "songs" ]);
                alert("Your Upload has failed. Please try a different file or try again later");
            },
            uploadDone: () => {
                if (state.songs)
                    state.songs[ state.songs.findIndex(x => x.id == uploadId) ].progress = 100;
                state.songs = State([ ...state.songs ?? [] ] as Drop[ "songs" ]);
            },
            credentials: () => API.getToken(),
            backendResponse: (id: string) => {
                if (state.songs) {
                    state.songs[ state.songs.findIndex(x => x.id == uploadId) ].progress = undefined;
                    state.songs[ state.songs.findIndex(x => x.id == uploadId) ].file = id;
                }
                state.uploadingSongs = <StateHandler<string[]>>state.uploadingSongs.filter(x => x != uploadId);
                state.songs = State([ ...state.songs ?? [] ] as Drop[ "songs" ]);
            },
            // deno-lint-ignore require-await
            onUploadTick: async (percentage) => {
                if (state.songs)
                    state.songs[ state.songs.findIndex(x => x.id == uploadId) ].progress = percentage;
                state.songs = State([ ...state.songs ?? [] ] as Drop[ "songs" ]);
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
        StreamingUploadHandler(`music/drops/${params.get("id")!}/upload`, {
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