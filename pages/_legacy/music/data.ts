import { API, StreamingUploadHandler } from "shared/mod.ts";
import { delay } from "std/async/delay.ts";
import { AdvancedImage, asState, Reference, StateHandler } from "webgen/mod.ts";
import { Artist, Song } from "../../../spec/music.ts";

export function uploadSongToDrop(state: StateHandler<{ songs: Song[]; artists: Artist[]; language: string | undefined; primaryGenre: string | undefined; secondaryGenre: string | undefined; _id: string }>, uploadingSongs: Reference<string[]>, file: File) {
    const uploadId = crypto.randomUUID();
    uploadingSongs.addItem(uploadId);

    const cleanedUpTitle = file.name
        .replaceAll("_", " ")
        .replaceAll("-", " ")
        .replace(/\.[^/.]+$/, "");

    state.songs = asState<Song[]>([...state.songs, {
        id: uploadId,
        title: cleanedUpTitle,
        artists: state.artists,
        // TODO: country should be real country
        country: state.language!,
        instrumental: false,
        explicit: false,
        secondaryGenre: state.secondaryGenre!,
        year: new Date().getFullYear(),
        progress: 0,
        file: undefined!,
    }]);

    StreamingUploadHandler(`music/drops/${state._id}/upload`, {
        failure: () => {
            uploadingSongs.removeItem(uploadId);
            if (state.songs) {
                state.songs[state.songs.findIndex((x) => x.id == uploadId)].progress = -1;
            }
            state.songs = asState<Song[]>([...state.songs]);
            alert("Your Upload has failed. Please try a different file or try again later");
        },
        uploadDone: () => {
            if (state.songs) {
                state.songs[state.songs.findIndex((x) => x.id == uploadId)].progress = 100;
            }
            state.songs = asState<Song[]>([...state.songs]);
        },
        credentials: () => API.getToken(),
        backendResponse: (id: string) => {
            if (state.songs) {
                state.songs[state.songs.findIndex((x) => x.id == uploadId)].progress = undefined;
                state.songs[state.songs.findIndex((x) => x.id == uploadId)].file = id;
            }
            uploadingSongs.removeItem(uploadId);
            state.songs = asState<Song[]>([...state.songs]);
        },
        // deno-lint-ignore require-await
        onUploadTick: async (percentage) => {
            if (state.songs) {
                state.songs[state.songs.findIndex((x) => x.id == uploadId)].progress = percentage;
            }
            state.songs = asState<Song[]>([...state.songs]);
        },
    }, file);
}

//is there a better way for those typings??
export function uploadArtwork(id: string, file: File, artworkClientData: Reference<AdvancedImage | undefined>, loading: Reference<boolean>, artwork: Reference<string> | Reference<string | undefined>) {
    const blobUrl = URL.createObjectURL(file);
    artworkClientData.setValue({ type: "uploading", filename: file.name, blobUrl, percentage: 0 });
    loading.setValue(true);

    setTimeout(() => {
        StreamingUploadHandler(`music/drops/${id}/upload`, {
            failure: () => {
                loading.setValue(false);
                artworkClientData.setValue(undefined);
                alert("Your Upload has failed. Please try a different file or try again later");
            },
            uploadDone: () => {
                artworkClientData.setValue({ type: "waiting-upload", filename: file.name, blobUrl });
            },
            credentials: () => API.getToken(),
            backendResponse: (id) => {
                artworkClientData.setValue({ type: "direct", source: async () => await file });
                artwork.setValue(id);
                loading.setValue(false);
            },
            onUploadTick: async (percentage) => {
                artworkClientData.setValue({ type: "uploading", filename: file.name, blobUrl, percentage });
                await delay(2);
            },
        }, file);
    });
}
