import { API, createActionList, createBreadcrumb, createTagList, LoadingSpinner, Navigation, stupidErrorAlert } from "shared/mod.ts";
import { asRef, Body, Button, ButtonStyle, Color, Empty, Grid, Horizontal, isMobile, Label, LinkButton, SheetDialog, Vertical } from "webgen/mod.ts";
import "../../assets/css/main.css";
import "../../assets/css/music.css";
import { DynaNavigation } from "../../components/nav.ts";
import { Drop, DropType, Share } from "../../spec/music.ts";
import { permCheck, RegisterAuthRefresh, renewAccessTokenIfNeeded, saveBlob, showPreviewImage, streamingImages } from "../shared/helper.ts";
import { ChangeDrop } from "./views/changeDrop.ts";
import { ChangeSongs } from "./views/changeSongs.ts";
import { DropTypeToText } from "./views/list.ts";

await RegisterAuthRefresh();

const params = new URLSearchParams(location.search);
const data = Object.fromEntries(params.entries());
if (!data.id) {
    alert("ID is missing");
    location.href = "/c/music";
}

const drop = asRef(<Drop | undefined> undefined);
const services = asRef<Record<string, string> | undefined>(undefined);
const share = asRef(<Share | undefined | { slug: undefined }> undefined);

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
                                const releaseDate = new Date(drop.release);
                                if (releaseDate.getTime() - Date.now() < 14 * 24 * 60 * 60 * 1000 && releaseDate.getTime() - Date.now() > 0) {
                                    WarningDialog.open();
                                } else {
                                    await API.music.id(drop._id).type.post(DropType.UnderReview);
                                    location.reload();
                                }
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
                            clickHandler: async () => {
                                if (services.getValue() === undefined) {
                                    services.setValue(await API.music.id(drop._id).services().then(stupidErrorAlert));
                                }
                                StreamingServiesDialog.open();
                            },
                        }
                        : Empty(),
                    drop.type === "PUBLISHED"
                        ? {
                            id: "share",
                            title: "Sharing Link",
                            subtitle: "Show your music to all your listeners",
                            clickHandler: async () => {
                                share.setValue(await API.music.id(drop._id).share.get().then(stupidErrorAlert));
                                SharingDialog.open();
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

const StreamingServiesDialog = SheetDialog(
    sheetStack,
    "Streaming Services",
    services.map((services) =>
        services === undefined ? Empty() : Vertical(
            ...Object.entries(services).map(([key, value]) =>
                Button("Open in " + key[0].toUpperCase() + key.slice(1))
                    .onClick(() => globalThis.open(value, "_blank"))
                    .addPrefix(
                        streamingImages[key]
                            .setHeight("1.5rem")
                            .setWidth("1.5rem")
                            .setMargin("0 0.35rem 0 -0.3rem"),
                    )
            ),
            Object.values(services).every((x) => !x) ? Label("No Links available :(").setTextSize("2xl") : Empty(),
        ).setGap("0.5rem")
    ).asRefComponent(),
);
const WarningDialog = SheetDialog(
    sheetStack,
    "Warning",
    Vertical(
        Label("You are about to publish your Drop which is scheduled to be released in less than 14 days.").setTextSize("xl"),
        Label("There is a high chance that your Drop will not be released on time by all Streaming Services.").setTextSize("xl"),
        Label("Do you want to continue?").setTextSize("xl"),
        Horizontal(
            Button("Cancel").onClick(() => {
                WarningDialog.close();
            }),
            Button("Publish Anyway").onPromiseClick(async () => {
                await API.music.id(drop.getValue()!._id).type.post(DropType.UnderReview);
                location.reload();
                WarningDialog.close();
            }),
        ).setJustifyContent("end").setGap("1rem"),
    ),
);
//const prefix = "bbn.music/";
const prefix = "bbn.one/share?s=";
const SharingDialog = SheetDialog(
    sheetStack,
    "Manage Sharing Link",
    share.map((shareVal) =>
        shareVal
            ? Vertical(
                Label("Your Link:").setTextSize("xl").setCssStyle("color", shareVal.slug ? "" : "gray"),
                LinkButton(prefix + (shareVal.slug ?? "xxx"), "https://" + prefix + (shareVal.slug ?? "xxx"), "_blank")
                    .addClass("link")
                    .setStyle(ButtonStyle.Inline).setColor(shareVal.slug ? Color.Colored : Color.Disabled),
                Label("Services Found:").setTextSize("xl").setCssStyle("color", shareVal.slug ? "" : "gray"),
                Horizontal(
                    ...Object.keys(shareVal.slug ? shareVal.services : { spotify: "", deezer: "", tidal: "", apple: "" }).map((img) =>
                        streamingImages[img]
                            .setHeight("1.5rem")
                            .setWidth("1.5rem")
                            .setCssStyle("filter", shareVal.slug ? "brightness(0) invert(1)" : "brightness(0) invert(1) brightness(0.1)")
                    ),
                ).setGap("1rem").setJustifyContent("start").setPadding("0 .3rem"),
                Button(shareVal.slug ? "Disable Link Sharing" : "Enable Link Sharing").onPromiseClick(async () => {
                    if (shareVal.slug) {
                        await API.music.id(drop.getValue()!._id).share.remove();
                        share.setValue({ slug: undefined });
                    } else {
                        share.setValue(await API.music.id(drop.getValue()!._id).share.create().then(stupidErrorAlert));
                    }
                }).setMargin("1rem 0 0 0"),
            )
            : Empty()
    ).asRefComponent(),
);
