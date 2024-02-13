import { API, LoadingSpinner, Navigation, createActionList, createBreadcrumb, createTagList, stupidErrorAlert } from "shared/mod.ts";
import { Body, Empty, Grid, Horizontal, Label, Spacer, Vertical, WebGen, asState, isMobile } from "webgen/mod.ts";
import '../../../assets/css/main.css';
import '../../../assets/css/music.css';
import { DynaNavigation } from "../../../components/nav.ts";
import { Drop, DropType } from "../../../spec/music.ts";
import '../../hosting/views/table2.css';
import { DropTypeToText } from "../../music/views/list.ts";
import { RegisterAuthRefresh, changeThemeColor, permCheck, renewAccessTokenIfNeeded, saveBlob, sheetStack, showPreviewImage } from "../helper.ts";
import { ChangeDrop } from "./changeDrop.ts";
import { ChangeSongs } from "./changeSongs.ts";

await RegisterAuthRefresh();

WebGen({
    events: {
        themeChanged: changeThemeColor()
    }
});

const params = new URLSearchParams(location.search);
const data = Object.fromEntries(params.entries());
if (!data.id) {
    alert("ID is missing");
    location.href = "/music";
}

const state = asState({
    drop: <Drop | undefined>undefined,
});

sheetStack.setDefault(Vertical(
    DynaNavigation("Music"),
    state.$drop.map(drop => drop ? Navigation({
        title: drop.title,
        children: [
            Horizontal(
                //TODO: Make this look better
                Label(DropTypeToText(drop.type)).setTextSize("2xl"),
                Spacer()
            ),
            {
                id: "edit-drop",
                title: "Drop",
                subtitle: "Change Title, Release Date, ...",
                children: [
                    ChangeDrop(drop)
                ]
            },
            {
                id: "edit-songs",
                title: "Songs",
                subtitle: "Move Songs, Remove Songs, Add Songs, ...",
                children: [
                    ChangeSongs(drop),
                ]
            },
            {
                id: "export",
                title: "Export",
                subtitle: "Download your complete Drop with every Song",
                clickHandler: async () => {
                    const blob = await API.music.id(drop._id).download().then(stupidErrorAlert);
                    saveBlob(blob, `${drop.title}.tar`);
                }
            },
            Permissions.canCancelReview(drop.type) ?
                {
                    id: "cancel-review",
                    title: "Cancel Review",
                    subtitle: "Need to change Something? Cancel it now",
                    clickHandler: async () => {
                        await API.music.id(drop._id).type.post(DropType.Private);
                        location.reload();
                    },
                } : Empty(),
            Permissions.canSubmit(drop.type) ?
                {
                    id: "publish",
                    title: "Publish",
                    subtitle: "Submit your Drop for Approval",
                    clickHandler: async () => {
                        await API.music.id(drop._id).type.post(DropType.UnderReview);
                        location.reload();
                    },
                } : Empty(),
            Permissions.canTakedown(drop.type) ?
                {
                    id: "takedown",
                    title: "Takedown",
                    subtitle: "Completely Takedown your Drop",
                    clickHandler: async () => {
                        await API.music.id(drop._id).type.post(DropType.Private);
                        location.reload();
                    },
                } : Empty()
        ]
    })
        .addClass(
            isMobile.map(mobile => mobile ? "mobile-navigation" : "navigation"),
            "limited-width"
        )
        .setHeader((menu) => isMobile.map(mobile => {
            const list = Vertical(
                menu.path.map(x => x == "-/" ?
                    Grid(
                        showPreviewImage(<Drop>{ _id: drop._id, artwork: drop.artwork }).addClass("image-preview")
                    ).setEvenColumns(1, "10rem")
                    : Empty()
                ).asRefComponent(),
                createBreadcrumb(menu),
                createTagList(menu)
            ).setGap();
            if (!mobile) return Grid(
                list,
                createActionList(menu)
            ).setRawColumns("auto max-content").setGap().setAlignItems("center");
            return list;
        }).asRefComponent())
        : LoadingSpinner()
    ).asRefComponent(),
));

Body(sheetStack);

const Permissions = {
    canTakedown: (type: DropType) => type == "PUBLISHED",
    canSubmit: (type: DropType) => (<DropType[]>[ "UNSUBMITTED", "PRIVATE" ]).includes(type),
    canEdit: (type: DropType) => (type == "PRIVATE" || type == "UNSUBMITTED") || permCheck("/bbn/manage/drops"),
    canCancelReview: (type: DropType) => type == "UNDER_REVIEW"
};

renewAccessTokenIfNeeded().then(async () => {
    await API.music.id(data.id).get()
        .then(stupidErrorAlert)
        .then(drop => state.drop = drop);
});