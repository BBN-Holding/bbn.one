import { ZodError } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { API, LoadingSpinner, Navigation, createActionList, createBreadcrumb, createTagList, stupidErrorAlert } from "shared/mod.ts";
import { AdvancedImage, Body, Empty, Grid, Horizontal, Label, Spacer, State, Vertical, WebGen, isMobile } from "webgen/mod.ts";
import '../../../assets/css/main.css';
import '../../../assets/css/music.css';
import { DynaNavigation } from "../../../components/nav.ts";
import { Artist, Drop, DropType, Song } from "../../../spec/music.ts";
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

const state = State({
    loaded: false,
    _id: data.id,
    title: <string>undefined!,
    type: <DropType | undefined>undefined,
    release: <string | undefined>undefined,
    language: <string | undefined>undefined,
    artists: <Artist[]>[],
    primaryGenre: <string | undefined>undefined,
    secondaryGenre: <string | undefined>undefined,
    compositionCopyright: <string | undefined>undefined,
    soundRecordingCopyright: <string | undefined>undefined,
    artwork: <string | undefined>undefined,
    artworkClientData: <AdvancedImage | string | undefined>undefined,
    loading: false,
    uploadingSongs: <string[]>[],
    songs: <Song[]>[],
    validationState: <ZodError | undefined>undefined
});

sheetStack.setDefault(Vertical(
    DynaNavigation("Music"),
    state.$loaded.map(loaded => loaded ? Navigation({
        title: state.$title,
        children: [
            Horizontal(
                //TODO: Make this look better
                Label(DropTypeToText(state.type!)).setTextSize("2xl"),
                Spacer()
            ),
            {
                id: "edit-drop",
                title: "Drop",
                subtitle: "Change Title, Release Date, ...",
                children: [
                    ChangeDrop(state)
                ]
            },
            {
                id: "edit-songs",
                title: "Songs",
                subtitle: "Move Songs, Remove Songs, Add Songs, ...",
                children: [
                    ChangeSongs(state),
                ]
            },
            {
                id: "export",
                title: "Export",
                subtitle: "Download your complete Drop with every Song",
                clickHandler: async () => {
                    const blob = await API.music.id(state._id).download().then(stupidErrorAlert);
                    saveBlob(blob, `${state.title}.tar`);
                }
            },
            Permissions.canCancelReview(state.type!) ?
                {
                    id: "cancel-review",
                    title: "Cancel Review",
                    subtitle: "Need to change Something? Cancel it now",
                    clickHandler: async () => {
                        await API.music.id(state._id).type.post(DropType.Private);
                        location.reload();
                    },
                } : Empty(),
            Permissions.canSubmit(state.type!) ?
                {
                    id: "publish",
                    title: "Publish",
                    subtitle: "Submit your Drop for Approval",
                    clickHandler: async () => {
                        await API.music.id(state._id).type.post(DropType.UnderReview);
                        location.reload();
                    },
                } : Empty(),
            Permissions.canTakedown(state.type!) ?
                {
                    id: "takedown",
                    title: "Takedown",
                    subtitle: "Completely Takedown your Drop",
                    clickHandler: async () => {
                        await API.music.id(state._id).type.post(DropType.Private);
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
                        showPreviewImage(<Drop>{ _id: state._id, artwork: state.artwork }).addClass("image-preview")
                    ).setEvenColumns(1, "10rem")
                    : Empty()
                ).asRefComponent(),
                createBreadcrumb(menu),
                createTagList(menu)
            ).setGap();
            if (!mobile) return Grid(
                list,
                createActionList(menu)
            ).setRawColumns("auto max-content").setGap().setAlign("center");
            return list;
        }).asRefComponent())
        : LoadingSpinner()
    ).asRefComponent(),
));

Body(sheetStack);

const Permissions = {
    canTakedown: (type: DropType) => type == "PUBLISHED",
    canSubmit: (type: DropType) => (<Drop[ "type" ][]>[ "UNSUBMITTED", "PRIVATE" ]).includes(type),
    canEdit: (type: DropType) => (type == "PRIVATE" || type == "UNSUBMITTED") || permCheck("/bbn/manage/drops"),
    canCancelReview: (type: DropType) => type == "UNDER_REVIEW"
};

renewAccessTokenIfNeeded().then(async () => {
    await API.music.id(data.id).get()
        .then(stupidErrorAlert)
        .then(drop => {
            state.type = drop.type;
            state.title = drop.title;
            state.release = drop.release;
            state.language = drop.language;
            state.artists = State(drop.artists ?? []);
            state.primaryGenre = drop.primaryGenre;
            state.secondaryGenre = drop.secondaryGenre;
            state.compositionCopyright = drop.compositionCopyright;
            state.soundRecordingCopyright = drop.soundRecordingCopyright;
            state.artwork = drop.artwork;
            state.artworkClientData = <AdvancedImage | string | undefined>(drop.artwork ? <AdvancedImage>{ type: "direct", source: () => API.music.id(drop._id).artwork().then(stupidErrorAlert) } : undefined);
            state.songs = State(drop.songs ?? []);
        })
        .then(() => state.loaded = true);
});