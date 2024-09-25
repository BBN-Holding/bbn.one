import { API, createActionList, createBreadcrumb, createTagList, LoadingSpinner, Navigation, stupidErrorAlert } from "shared/mod.ts";
import { asRef, Body, Empty, Grid, isMobile, Label, Vertical, WebGen } from "webgen/mod.ts";
import "../../assets/css/main.css";
import "../../assets/css/music.css";
import { DynaNavigation } from "../../components/nav.ts";
import { Drop, DropType } from "../../spec/music.ts";
import { changeThemeColor, permCheck, RegisterAuthRefresh, renewAccessTokenIfNeeded, saveBlob, sheetStack, showPreviewImage } from "../shared/helper.ts";
import { ChangeDrop } from "./views/changeDrop.ts";
import { ChangeSongs } from "./views/changeSongs.ts";
import { DropTypeToText } from "./views/list.ts";

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
                            id: "spotify",
                            title: "Spotify",
                            subtitle: "Open your Drop on Spotify",
                            clickHandler: async () => {
                                const url = await API.music.id(drop._id).spotify().then(stupidErrorAlert);
                                globalThis.open(url.spotify, "_blank");
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
