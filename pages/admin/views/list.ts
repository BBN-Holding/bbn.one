import { Entry, PlainText, Vertical, Image, Box, ReCache, Button, Color, CommonIconType, IconButton, Dialog, Grid, TextInput } from "webgen/mod.ts";
import { state } from "../state.ts";
import { DropType, OAuthApp, File, Server } from "../../../spec/music.ts";
import { ReviewEntry } from "./entryReview.ts";
import { templateArtwork } from "../../../assets/imports.ts";
import { API } from "../../manager/RESTSpec.ts";

export function listReviews() {
    return Vertical(
        (state.reviews?.find(x => x.type == DropType.UnderReview)) ? [
            PlainText("Reviews")
                .addClass("list-title")
                .addClass("limited-width"),
            Vertical(...state.reviews.filter(x => x.type == DropType.UnderReview).map(x => ReviewEntry(x))).setGap("1rem"),
        ] : [
            PlainText("No Reviews")
                .addClass("list-title")
                .addClass("limited-width"),
            PlainText("All done! You are now allowed to lean back and relax. 🧋")
                .addClass("limited-width"),
        ],
        state.reviews!.filter(x => x.type == DropType.Publishing).length == 0 ? null :
            PlainText("Publishing")
                .addClass("list-title")
                .addClass("limited-width"),
        ...state.reviews!.filter(x => x.type == DropType.Publishing).map(x =>
            ReviewEntry(x)
        ),
        PlainText("Published")
            .addClass("list-title")
            .addClass("limited-width"),
        ...state.reviews!.filter(x => x.type == DropType.Published).map(x =>
            ReviewEntry(x)
        ),
        PlainText("Private")
            .addClass("list-title")
            .addClass("limited-width"),
        ...state.reviews!.filter(x => x.type == DropType.Private).map(x =>
            ReviewEntry(x)
        ),
        PlainText("Rejected")
            .addClass("list-title")
            .addClass("limited-width"),
        ...state.reviews!.filter(x => x.type == DropType.ReviewDeclined).map(x =>
            ReviewEntry(x)
        ),
        PlainText("Drafts")
            .addClass("list-title")
            .addClass("limited-width"),
        ...state.reviews!.filter(x => x.type == DropType.Unsubmitted).map(x =>
            ReviewEntry(x)
        )
    )
        .setGap("1rem");
}

export function listServers(servers: Server[]) {
    return Vertical(
        servers.map(server => Entry({
            title: server.name,
            subtitle: server._id,
        }))
    )
}

export function listOAuth(apps: OAuthApp[]) {
    return Vertical(
        apps.map(app => Entry({
            title: app.name,
            subtitle: app._id,
        }).addPrefix(ReCache("appicon-" + app._id, () => Promise.resolve(), (type) => {
            const imageSource = type == "loaded" && app.icon !== ""
                ? Image({ type: "direct", source: () => API.admin(API.getToken()).files.download(app.icon) }, "A Song Artwork")
                : Image(templateArtwork, "A Placeholder Artwork.");
            return Box(imageSource)
                .addClass("image-square");
        })).addSuffix(IconButton(CommonIconType.Delete, "delete").setColor(Color.Critical).onClick(() => {
            API.oauth(API.getToken()).delete(app._id)
        })).addSuffix(Button("View").onClick(() => {
            oAuthViewDialog(app).open();
        })).addClass("limited-width"))
    );
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
}

export function listFiles(files: File[]) {
    return Vertical(
        files.map(file => Entry({
            title: file.metadata.filename,
            subtitle: file._id,
        }).addPrefix(ReCache("fileicon-" + file._id, () => Promise.resolve(), (type) => {
            const imageSource = type == "loaded" && file.metadata.type.startsWith("image/")
                ? Image({ type: "direct", source: () => API.admin(API.getToken()).files.download(file._id) }, "A Song Artwork")
                : Image(templateArtwork, "A Placeholder Artwork.");
            return Box(imageSource)
                .addClass("image-square");
        })).addSuffix(IconButton(CommonIconType.Delete, "delete").setColor(Color.Critical).onClick(() => {
            API.admin(API.getToken()).files.delete(file._id)
        })).addClass("limited-width"))
    );
}