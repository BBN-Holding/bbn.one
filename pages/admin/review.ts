import { API, LoadingSpinner, Navigation, createActionList, createBreadcrumb, createTagList, stupidErrorAlert } from "shared";
import { Box, Button, ButtonStyle, Color, Entry, Grid, Horizontal, Label, Spacer, Vertical, View, WebGen, isMobile } from "webgen/mod.ts";
import '../../assets/css/main.css';
import '../../assets/css/music.css';
import { DynaNavigation } from "../../components/nav.ts";
import { RegisterAuthRefresh, changeThemeColor, permCheck, renewAccessTokenIfNeeded, saveBlob, showPreviewImage, showProfilePicture } from "../_legacy/helper.ts";
import { ChangeDrop } from "../_legacy/music/changeDrop.ts";
import { ChangeSongs } from "../_legacy/music/changeSongs.ts";
import { DropTypeToText } from "../music/views/list.ts";
import { ApproveDialog, DeclineDialog, dialogState } from "./dialog.ts";
import { reviewState } from "./state.ts";
import { changeState, changeTypeDialog } from "./views/entryReview.ts";

await RegisterAuthRefresh();

if (!permCheck(
    "/hmsys/user/manage",
    "/bbn/manage"
)) {
    location.href = "/";
}

WebGen({
    events: {
        themeChanged: changeThemeColor()
    }
});

const params = new URLSearchParams(location.search);
const data = Object.fromEntries(params.entries());
if (!data.id) {
    alert("ID is missing");
    location.href = "/admin";
}

View(() => Vertical(
    ...DynaNavigation("Admin"),
    Grid(
        Vertical(
            Label("User Details", "h1").setAlign("center"),
            reviewState.$drop.map(drop => drop ? Vertical(
                showProfilePicture(drop.user),
                Label(`Username: ${drop.user.profile.username}`),
                Label(`Email: ${drop.user.profile.email}`),
                Label(`ID: ${drop.user._id}`),
            ).setGap("var(--gap)") : LoadingSpinner()).asRefComponent(),
            Label("User's Drops", "h1").setAlign("center"),
            reviewState.$drops.map(drops => drops ? Vertical(
                ...drops.map(drop => Entry({ title: drop.title, subtitle: drop.type }).addClass("small"))).setGap("var(--gap)") : LoadingSpinner()).asRefComponent(),
        )
            .setAttribute("style", "border-style: solid;").setGap("var(--gap)").setBorderRadius("tiny"),
        reviewState.$drop.map(drop => drop ? Navigation({
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
        ).asRefComponent().setJustify("center").setAlign("center"),
        Vertical(
            Label("Drop History", "h1").setAlign("center"),
            reviewState.$drop.map(drop => drop ? Vertical(
                ...drop.events.map(entry => Vertical(
                    Label(entry.meta.action),
                    Label(entry.userId),
                ).setGap("var(--gap)"))).setGap("var(--gap)") : LoadingSpinner()).asRefComponent(),
            Spacer(),
            Button("Change Drop Type")
                .setStyle(ButtonStyle.Inline)
                .setColor(Color.Colored)
                .addClass("tag")
                .setMargin("var(--gap)")
                .onClick(() => {
                    changeTypeDialog.open();
                    changeState.drop = reviewState.drop;
                    changeState.type = reviewState.drop!.type;
                    changeTypeDialog.onClose(() => refreshReviewState());
                }),
            Horizontal(
                Button("Decline")
                    .setStyle(ButtonStyle.Inline)
                    .setColor(Color.Colored)
                    .addClass("tag")
                    .onClick(() => {
                        DeclineDialog.open();
                        dialogState.drop = reviewState.drop!;
                        DeclineDialog.onClose(() => refreshReviewState());
                    }),
                Button("Approve")
                    .setStyle(ButtonStyle.Normal)
                    .setColor(Color.Colored)
                    .addClass("tag")
                    .onClick(() => {
                        ApproveDialog.open();
                        dialogState.drop = reviewState.drop!;
                        ApproveDialog.onClose(() => refreshReviewState());
                    }),
            ).setGap("var(--gap)"),
        ).setAttribute("style", "border-style: solid;").setBorderRadius("tiny")
    )
        .setGap("var(--gap)")
        .setRawColumns("1fr 3fr 1fr"),
))
    .appendOn(document.body);

renewAccessTokenIfNeeded()
    .then(() => refreshReviewState());

async function refreshReviewState() {
    reviewState.drop = await API.admin.drops.id(data.id).then(stupidErrorAlert);
    reviewState.drops = await API.admin.drops.user(reviewState.drop!.user._id).then(stupidErrorAlert);
}