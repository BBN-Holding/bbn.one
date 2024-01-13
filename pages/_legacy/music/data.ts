import { API, StreamingUploadHandler } from "shared/mod.ts";
import { delay } from "std/async/delay.ts";
import { AdvancedImage, State, StateHandler } from "webgen/mod.ts";
import { Artist, Song } from "../../../spec/music.ts";

export function uploadSongToDrop(state: StateHandler<{ uploadingSongs: string[]; songs: Song[]; artists: Artist[], language: string | undefined, primaryGenre: string | undefined, secondaryGenre: string | undefined, _id: string; }>, file: File) {
    const uploadId = crypto.randomUUID();
    state.uploadingSongs.push(uploadId);

    const cleanedUpTitle = file.name
        .replaceAll("_", " ")
        .replaceAll("-", " ")
        .replace(/\.[^/.]+$/, "");

    state.songs = State<Song[]>([ ...state.songs, {
        id: uploadId,
        title: cleanedUpTitle,
        artists: state.artists,
        // TODO: country should be real country
        country: state.language!,
        instrumental: false,
        explicit: false,
        primaryGenre: state.primaryGenre!,
        secondaryGenre: state.secondaryGenre!,
        year: new Date().getFullYear(),
        progress: 0,
        file: undefined!
    } ]);

    StreamingUploadHandler(`music/drops/${state._id}/upload`, {
        failure: () => {
            state.uploadingSongs = <StateHandler<string[]>>state.uploadingSongs.filter(x => x != uploadId);
            if (state.songs)
                state.songs[ state.songs.findIndex(x => x.id == uploadId) ].progress = -1;
            state.songs = State<Song[]>([ ...state.songs ]);
            alert("Your Upload has failed. Please try a different file or try again later");
        },
        uploadDone: () => {
            if (state.songs)
                state.songs[ state.songs.findIndex(x => x.id == uploadId) ].progress = 100;
            state.songs = State<Song[]>([ ...state.songs ]);
        },
        credentials: () => API.getToken(),
        backendResponse: (id: string) => {
            if (state.songs) {
                state.songs[ state.songs.findIndex(x => x.id == uploadId) ].progress = undefined;
                state.songs[ state.songs.findIndex(x => x.id == uploadId) ].file = id;
            }
            state.uploadingSongs = <StateHandler<string[]>>state.uploadingSongs.filter(x => x != uploadId);
            state.songs = State<Song[]>([ ...state.songs ]);
        },
        // deno-lint-ignore require-await
        onUploadTick: async (percentage) => {
            if (state.songs)
                state.songs[ state.songs.findIndex(x => x.id == uploadId) ].progress = percentage;
            state.songs = State<Song[]>([ ...state.songs ]);
        }
    }, file);
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