import { API, createActionList, createBreadcrumb, createTagList, LoadingSpinner, Navigation, stupidErrorAlert } from "shared/mod.ts";
import { asRef, Body, Button, Color, Empty, Grid, Image, ImageComponent, isMobile, Label, SheetDialog, Vertical, WebGen } from "webgen/mod.ts";
import "../../assets/css/main.css";
import "../../assets/css/music.css";
import { DynaNavigation } from "../../components/nav.ts";
import { Drop, DropType } from "../../spec/music.ts";
import { changeThemeColor, permCheck, RegisterAuthRefresh, renewAccessTokenIfNeeded, saveBlob, sheetStack, showPreviewImage } from "../shared/helper.ts";
import { ChangeDrop } from "./views/changeDrop.ts";
import { ChangeSongs } from "./views/changeSongs.ts";
import { DropTypeToText } from "./views/list.ts";

// @deno-types="https://raw.githubusercontent.com/lucsoft-DevTeam/lucsoft.de/master/custom.d.ts"
import spotify from "../music-landing/assets/spotify.svg";
// @deno-types="https://raw.githubusercontent.com/lucsoft-DevTeam/lucsoft.de/master/custom.d.ts"
import deezer from "../music-landing/assets/deezer.svg";
// @deno-types="https://raw.githubusercontent.com/lucsoft-DevTeam/lucsoft.de/master/custom.d.ts"
import tidal from "../music-landing/assets/tidal.svg";

await RegisterAuthRefresh();

WebGen({
    events: {
        themeChanged: changeThemeColor(),
    },
});

const params = new URLSearchParams(location.search);
const data = Object.fromEntries(params.entries());
if (!data.id) {
    alert("ID is missing");
    location.href = "/c/music";
}

const drop = asRef(<Drop | undefined> undefined);

sheetStack.setDefault(Vertical(
    DynaNavigation("Music"),
    drop.map((drop) =>
        drop
            ? Navigation({
                title: drop.title,
                children: [
                    Label(DropTypeToText(drop.type)).setTextSize("2xl"),
                    {
                        id: "edit-drop",
                        title: "Drop",
                        subtitle: "Change Title, Release Date, ...",
                        children: [
                            ChangeDrop(drop),
                        ],
                    },
                    {
                        id: "edit-songs",
                        title: "Songs",
                        subtitle: "Move Songs, Remove Songs, Add Songs, ...",
                        children: [
                            ChangeSongs(drop),
                        ],
                    },
                    {
                        id: "export",
                        title: "Export",
                        subtitle: "Download your complete Drop with every Song",
                        clickHandler: async () => {
                            const blob = await API.music.id(drop._id).download().then(stupidErrorAlert);
                            saveBlob(blob, `${drop.title}.tar`);
                        },
                    },
                    Permissions.canCancelReview(drop.type)
                        ? {
                            id: "cancel-review",
                            title: "Cancel Review",
                            subtitle: "Need to change Something? Cancel it now",
                            clickHandler: async () => {
                                await API.music.id(drop._id).type.post(DropType.Private);
                                location.reload();
                            },
                        }
                        : Empty(),
                    Permissions.canSubmit(drop.type)
                        ? {
                            id: "publish",
                            title: "Publish",
                            subtitle: "Submit your Drop for Approval",
                            clickHandler: async () => {
                                await API.music.id(drop._id).type.post(DropType.UnderReview);
                                location.reload();
                            },
                        }
                        : Empty(),
                    Permissions.canTakedown(drop.type)
                        ? {
                            id: "takedown",
                            title: "Takedown",
                            subtitle: "Completely Takedown your Drop",
                            clickHandler: async () => {
                                await API.music.id(drop._id).type.post(DropType.Private);
                                location.reload();
                            },
                        }
                        : Empty(),
                    drop.type === "PUBLISHED"
                        ? {
                            id: "streamingservices",
                            title: "Open",
                            subtitle: "Navigate to your Drop on Streaming Services",
                            clickHandler: () => {
                                StreamingServiesDialog.open();
                            },
                        }
                        : Empty(),
                ],
            })
                .addClass(
                    isMobile.map((mobile) => mobile ? "mobile-navigation" : "navigation"),
                    "limited-width",
                )
                .setHeader((menu) =>
                    isMobile.map((mobile) => {
                        const list = Vertical(
                            menu.path.map((x) => x == "-/" ? Grid(showPreviewImage(drop).addClass("image-preview")).setEvenColumns(1, "10rem") : Empty()).asRefComponent(),
                            createBreadcrumb(menu),
                            createTagList(menu),
                        ).setGap();
                        if (!mobile) {
                            return Grid(
                                list,
                                createActionList(menu),
                            ).setRawColumns("auto max-content").setGap().setAlignItems("center");
                        }
                        return list;
                    }).asRefComponent()
                )
            : LoadingSpinner()
    ).asRefComponent(),
));

Body(sheetStack);

const Permissions = {
    canTakedown: (type: DropType) => type == "PUBLISHED",
    canSubmit: (type: DropType) => (<DropType[]> ["UNSUBMITTED", "PRIVATE"]).includes(type),
    canEdit: (type: DropType) => (type == "PRIVATE" || type == "UNSUBMITTED") || permCheck("/bbn/manage/drops"),
    canCancelReview: (type: DropType) => type == "UNDER_REVIEW",
};

renewAccessTokenIfNeeded().then(async () => {
    await API.music.id(data.id).get()
        .then(stupidErrorAlert)
        .then((x) => drop.setValue(x));
});

const streamingImages: Record<string, ImageComponent> = {
    spotify: Image(spotify, "Spotify"),
    deezer: Image(deezer, "Deezer"),
    tidal: Image(tidal, "Tidal"),
};

const StreamingServiesDialog = SheetDialog(
    sheetStack,
    "Streaming Services",
    await API.music.id(data.id).services().then(stupidErrorAlert).then((x) =>
        Vertical(
            ...Object.entries(x).map(([key, value]) =>
                Button("Open in " + key[0].toUpperCase() + key.slice(1))
                    .onClick(() => globalThis.open(value, "_blank"))
                    .addPrefix(
                        streamingImages[key]
                            .setHeight("1.5rem")
                            .setWidth("1.5rem")
                            .setMargin("0 0.35rem 0 -0.3rem"),
                    )
            ),
            Object.values(x).every((x) => !x) ? Label("No Links available :(").setTextSize("2xl") : Empty(),
        ).setGap("0.5rem")
    ),
);
