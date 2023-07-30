import { API, asExternal, External, fileCache, RenderItem, stupidErrorAlert } from "shared";
import { Box, Button, Cache, Color, Dialog, Entry, Grid, IconButton, Image, MIcon, ref, TextInput } from "webgen/mod.ts";
import { templateArtwork } from "../../../assets/imports.ts";
import { File, OAuthApp, Transcript, Wallet } from "../../../spec/music.ts";
import { saveBlob } from "../../_legacy/helper.ts";
import { state } from "../state.ts";

export function userName(id: string) {
    return state.$users.map(it => it === "loading" || it.status === "rejected" ? "(TODO: Load me)" : it.value.find(x => x._id == id)?.profile.username ?? "Unknown User");
}

export function entryWallet(wallet: Wallet) {
    return Entry({
        title: ref`${userName(wallet.user)} - ${((wallet.balance?.restrained ?? 0) + (wallet.balance?.unrestrained ?? 0)).toString()}`,
        subtitle: `${wallet.user} - ${wallet._id} - ${wallet.cut}% - restrained: ${wallet.balance?.restrained} unrestrained: ${wallet.balance?.unrestrained}`,
    }).addClass("small");
}

/* export function entryTranscript(transcript: Transcript) {
    return Entry({
        title: ref`Ticket with ${transcript.with}`,
        subtitle: `${transcript.closed} - ${new Date(transcript.messages[0].timestamp).toISOString()}`,
    }).addClass("small");
} */

export function transcriptMenu(transcripts: External<Transcript[]> | "loading"): RenderItem[] {
    if (transcripts === "loading" || transcripts.status !== 'fulfilled') return [ {
        title: "Loading...",
        id: "loading",
    } ];
    const data = transcripts.value;
    return data.map(transcript => ({
        title: `${transcript.with}`,
        id: transcript._id,
        children: [
            {
                title: "Close" + transcript.with,
                id: "close",
            },
            ...transcript.messages.map((x, i) => (<RenderItem>{
                id: i.toString(),
                title: `${x.author}`,
                subtitle: x.content
            }))
        ]
    }));
}

export function entryOAuth(app: OAuthApp) {
    return Entry({
        title: app.name,
        subtitle: app._id,
    })
        .addPrefix(Cache("appicon-" + app._id, () => API.admin(API.getToken()).files.download(app.icon), (type, val) => {
            const imageSource = type == "loaded" && app.icon !== "" && val && val.status == "fulfilled"
                ? Image({ type: "direct", source: () => Promise.resolve(val.value) }, "O-Auth Icon")
                : Image(templateArtwork, "A Placeholder Artwork.");
            return Box(imageSource)
                .addClass("image-square");
        }))
        .addSuffix(IconButton(MIcon("delete"), "delete").setColor(Color.Critical).onClick(() => {
            API.oauth(API.getToken()).delete(app._id);
        }))
        .addSuffix(Button("View").onClick(() => {
            oAuthViewDialog(app).open();
        }))
        .addClass("small");
}

const oAuthViewDialog = (oauth: OAuthApp) => {
    const dialog = Dialog(() =>
        Grid(
            TextInput("text", "Name").setValue(oauth.name).setColor(Color.Disabled),
            TextInput("text", "Client ID").setValue(oauth._id).setColor(Color.Disabled),
            TextInput("text", "Client Secret").setValue(oauth.secret).setColor(Color.Disabled),
            TextInput("text", "Redirect URI").setValue(oauth.redirect).setColor(Color.Disabled),
        )
    ).allowUserClose().setTitle("OAuth App Details").addButton("Close", "remove");
    return dialog;
};

export function entryFile(file: File) {
    return Entry({
        title: file.filename,
        subtitle: file._id,
    }).addPrefix(Cache("fileicon-" + file._id, () => loadFilePreview(file._id), (type, val) => {
        if (type == "cache")
            return Image({ type: "loading" }, "Loading");
        const imageSource = type == "loaded" && file.metadata.type.startsWith("image/") && val?.status === "fulfilled"
            ? Image({ type: "direct", source: () => Promise.resolve(val.value) }, "A Song Artwork")
            : Image(templateArtwork, "A Placeholder Artwork.");
        return Box(imageSource)
            .addClass("image-square");
    })).addSuffix(IconButton(MIcon("download"), "download").onClick(async () => {
        const blob = await API.admin(API.getToken()).files.download(file._id).then(stupidErrorAlert);
        saveBlob(blob, file.filename)
    })).addSuffix(IconButton(MIcon("delete"), "delete").setColor(Color.Critical).onClick(() => {
        API.admin(API.getToken()).files.delete(file._id);
    }));
}

export async function loadFilePreview(id: string) {
    const cache = await fileCache();
    if (await cache.has(id)) return await asExternal(cache.get(id));
    const blob = await API.admin(API.getToken()).files.download(id);
    if (blob.status == "fulfilled")
        cache.set(id, blob.value);
    return blob;
}