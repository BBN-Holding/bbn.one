import { API, LoadingSpinner, Navigation, createActionList, createBreadcrumb, createTagList, stupidErrorAlert } from "shared/mod.ts";
import { Box, Grid, Horizontal, Label, Spacer, State, Vertical, View, WebGen, isMobile } from "webgen/mod.ts";
import '../../../assets/css/main.css';
import '../../../assets/css/music.css';
import { DynaNavigation } from "../../../components/nav.ts";
import { Drop, DropType } from "../../../spec/music.ts";
import { DropTypeToText } from "../../music/views/list.ts";
import { RegisterAuthRefresh, changeThemeColor, permCheck, renewAccessTokenIfNeeded, saveBlob, showPreviewImage } from "../helper.ts";
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

const state = State({
    drop: <Drop | undefined>undefined,
});

View(() => Vertical(
    DynaNavigation("Music"),
    state.$drop.map(drop => drop ? Navigation({
        title: drop.title,
        children: [
            Horizontal(
                //TODO: Make this look better
                Label(DropTypeToText(drop.type)).setFont(1.5),
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
            Permissions.canCancelReview(drop) ?
                {
                    id: "cancel-review",
                    title: "Cancel Review",
                    subtitle: "Need to change Something? Cancel it now",
                    clickHandler: async () => {
                        await API.music.id(drop._id).type.post(DropType.Private);
                        location.reload();
                    },
                } : Box().removeFromLayout(),
            Permissions.canSubmit(drop) ?
                {
                    id: "publish",
                    title: "Publish",
                    subtitle: "Submit your Drop for Approval",
                    clickHandler: async () => {
                        await API.music.id(drop._id).type.post(DropType.UnderReview);
                        location.reload();
                    },
                } : Box().removeFromLayout(),
            Permissions.canTakedown(drop) ?
                {
                    id: "takedown",
                    title: "Takedown",
                    subtitle: "Completely Takedown your Drop",
                    clickHandler: async () => {
                        await API.music.id(drop._id).type.post(DropType.Private);
                        location.reload();
                    },
                } : Box().removeFromLayout()
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
                        showPreviewImage(drop).addClass("image-preview")
                    ).setEvenColumns(1, "10rem")
                    : Box().removeFromLayout()
                ).asRefComponent(),
                createBreadcrumb(menu),
                createTagList(menu)
            ).setGap("var(--gap)");
            if (!mobile) return Grid(
                list,
                createActionList(menu)
            ).setRawColumns("auto max-content").setGap("var(--gap)").setAlign("center");
            return list;
        }).asRefComponent())
        : LoadingSpinner()
    ).asRefComponent(),
))
    .appendOn(document.body);

const Permissions = {
    canTakedown: (drop: Drop) => drop.type == "PUBLISHED",
    canSubmit: (drop: Drop) => (<Drop[ "type" ][]>[ "UNSUBMITTED", "PRIVATE" ]).includes(drop.type),
    canEdit: (drop: Drop) => (drop.type == "PRIVATE" || drop.type == "UNSUBMITTED") || permCheck("/bbn/manage/drops"),
    canCancelReview: (drop: Drop) => drop.type == "UNDER_REVIEW"
};

renewAccessTokenIfNeeded().then(async () => state.drop = await API.music.id(data.id).get().then(stupidErrorAlert));