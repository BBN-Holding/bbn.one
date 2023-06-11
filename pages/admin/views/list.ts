import { API, External, MenuItem } from "shared";
import { Box, Button, Color, CommonIconType, Dialog, Entry, Grid, IconButton, Image, ReCache, TextInput, ref, refMap } from "webgen/mod.ts";
import { templateArtwork } from "../../../assets/imports.ts";
import { File, OAuthApp, Transcript, Wallet } from "../../../spec/music.ts";
import { state } from "../state.ts";

export function userName(id: string) {
    return refMap(state.$users, it => it === "loading" || it.status === "rejected" ? "(TODO: Load me)" : it.value.find(x => x._id == id)?.profile.username ?? "Unknown User");
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

export function transcriptMenu(transcripts: External<Transcript[]> | "loading"): MenuItem[] {
    if (transcripts === "loading" || transcripts.status !== 'fulfilled') return [{
        title: "Loading...",
        id: "loading/",
    }];
    const data = transcripts.value;
    return data.map(transcript => ({
        title: `Ticket with ${transcript.with}`,
        id: `${transcript._id}/`,
        items: [
            {
                title: "Close" + transcript.with,
                id: "close/",
            },
            ...transcript.messages.map(x => (<MenuItem>{
                title: `${x.author}`,
                subtitle: x.content
            }))
        ]
    }))
}

export function entryOAuth(app: OAuthApp) {
    return Entry({
        title: app.name,
        subtitle: app._id,
    }).addPrefix(ReCache("appicon-" + app._id, () => API.admin(API.getToken()).files.download(app.icon), (type, val) => {
        const imageSource = type == "loaded" && app.icon !== "" && val && val.status == "fulfilled"
            ? Image({ type: "direct", source: () => Promise.resolve(val.value) }, "O-Auth Icon")
            : Image(templateArtwork, "A Placeholder Artwork.");
        return Box(imageSource)
            .addClass("image-square");
    })).addSuffix(IconButton(CommonIconType.Delete, "delete").setColor(Color.Critical).onClick(() => {
        API.oauth(API.getToken()).delete(app._id);
    })).addSuffix(Button("View").onClick(() => {
        oAuthViewDialog(app).open();
    })).addClass("small");
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
        title: file.metadata.filename,
        subtitle: file._id,
    }).addPrefix(ReCache("fileicon-" + file._id, () => API.admin(API.getToken()).files.download(file._id), (type, val) => {
        const imageSource = type == "loaded" && file.metadata.type.startsWith("image/") && val?.status === "fulfilled"
            ? Image({ type: "direct", source: () => Promise.resolve(val.value) }, "A Song Artwork")
            : Image(templateArtwork, "A Placeholder Artwork.");
        return Box(imageSource)
            .addClass("image-square");
    })).addSuffix(IconButton(CommonIconType.Download, "download").onClick(async () => {
        const blob = await API.admin(API.getToken()).files.download(file._id);
        if (blob.status !== "fulfilled") return;
        const url  = window.URL.createObjectURL(blob.value);
        window.open(url, '_blank');
    })).addSuffix(IconButton(CommonIconType.Delete, "delete").setColor(Color.Critical).onClick(() => {
        API.admin(API.getToken()).files.delete(file._id);
    })).addClass("limited-width");
}