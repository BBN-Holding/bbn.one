import { API, count, HeavyList, LoadingSpinner, Menu } from "shared";
import { Button, Color, Dialog, Grid, PlainText, Reactive, ref, refMap, State, StateHandler, TextInput, Vertical } from "webgen/mod.ts";
import { Server } from "../../../spec/music.ts";
import { listView } from "../../hosting/views/list.ts";
import { activeUser } from "../../manager/helper.ts";
import { listPayouts } from "../../music/views/list.ts";
import { upload } from "../loading.ts";
import { state } from "../state.ts";
import { UserPanel } from "../users.ts";
import { entryOAuth, listFiles, listReviews } from "./list.ts";

export const adminMenu = Menu({
    title: ref`Hi ${activeUser.$username} 👋`,
    id: "/",
    categories: {
        "overview/": {
            title: `Overview`,
            items: [
                {
                    id: "streams/",
                    title: "Total Streams",
                    subtitle: "1.2M"
                },
                {
                    id: "revenue/",
                    title: "Total Revenue",
                    subtitle: "$1.2M"
                },
                {
                    id: "payout/",
                    title: "Total Payouts",
                    subtitle: "$1.2M"
                }
            ]
        },
        "reviews/": {
            title: ref`Music Reviews ${count(state.$reviews)}`,
            custom: () => Reactive(state, "reviews", () =>
                listReviews()
            )
        },
        "users/": {
            title: ref`User ${count(state.$users)}`,
            custom: () => Reactive(state, "users", () =>
                UserPanel()
            )
        },
        "payouts/": {
            title: ref`Payout ${count(state.$payouts)}`,
            items: [
                {
                    title: "Upload Payout File (.xlsx)",
                    id: "upload+manual/",
                    action: () => {
                        upload("manual");
                    }
                },
                {
                    title: "Sync ISRCs (release_export.xlsx)",
                    id: "sync+isrc/",
                    action: () => {
                        upload("isrc");
                    }
                }
            ],
            custom: () => Reactive(state, "payouts", () =>
                Vertical(listPayouts(state.payouts ?? [], true))
                    .setGap("0.5rem")
            )
        },
        "oauth/": {
            title: ref`OAuth ${count(state.$oauth)}`,
            items: refMap(state.$oauth, it => it === "loading" || it.status === "rejected" ? [] : [
                {
                    title: "Add OAuth",
                    id: "add+oauth/",
                    action: () => {
                        addOAuthDialog.open();
                    }
                }
            ]),
            custom: () => HeavyList(state.$oauth, entryOAuth).setMargin("var(--gap)")
        },
        "files/": {
            title: ref`Files ${count(state.$files)}`,
            custom: () => Reactive(state, "files", () =>
                Vertical(listFiles(state.files ?? []))
                    .setGap("0.5rem")
            )
        },
        "servers/": {
            title: ref`Minecraft Servers ${count(state.$servers)}`,
            custom: () => Reactive(state, "servers", () =>
                listView(state.servers as StateHandler<Server[]>)
            )
        }
    },
    custom: () => LoadingSpinner()
})
    .setActivePath(refMap(state.$loaded, loaded => loaded ? '/overview/' : '/'));

const oAuthData = State({
    name: "",
    redirectURI: "",
    image: ""
});
const addOAuthDialog = Dialog(() =>
    Grid(
        PlainText("Add OAuth"),
        TextInput("text", "Name").sync(oAuthData, "name"),
        TextInput("text", "Redirect URI").sync(oAuthData, "redirectURI"),
        Button("Upload Image").onPromiseClick(async () => {
            oAuthData.image = await upload("oauth");
        }),
        Reactive(oAuthData, "image", () =>
            Button("Submit")
                .setColor(oAuthData.image === "" ? Color.Disabled : Color.Grayscaled)
                .onClick(() => {
                    API.oauth(API.getToken()).post(oAuthData.name, oAuthData.redirectURI, oAuthData.image);
                    addOAuthDialog.close();
                })
        )
    )
).setTitle("Add OAuth");