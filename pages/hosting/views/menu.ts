import { count, LoadingSpinner, Navigation, placeholder, RenderItem } from "shared";
import { BasicLabel, Box, Button, Color, Entry, Grid, isMobile, Label, ref } from "webgen/mod.ts";
import locations from "../../../data/locations.json" assert { type: "json" };
import serverTypes from "../../../data/servers.json" assert { type: "json" };
import { AuditTypes } from "../../../spec/music.ts";
import { activeUser, showProfilePicture } from "../../_legacy/helper.ts";
import { state } from "../data.ts";
import { startSidecarConnection, stopSidecarConnection, streamingPool } from "../loading.ts";
import { profileView } from "../views/profile.ts";
import { ChangeStateButton } from "./changeStateButton.ts";
import './details.css';
import { deleteServerDialog } from "./dialogs/deleteServerDialog.ts";
import { editServerDialog } from "./dialogs/editServerDialog.ts";
import './fileBrowser.css';
import { FileBrowser } from "./FileBrowser.ts";
import './list.css';
import { ServerDetails } from "./ServerDetails.ts";
import { auditLogs, hostingButtons } from "./state.ts";
import './table2.css';
import { auditLabels, labels } from "./translation.ts";

export const hostingMenu = Navigation({
    title: ref`Hi ${activeUser.$username} 👋`,
    actions: hostingButtons,
    categories: [
        {
            id: "servers",
            title: ref`Servers ${count(state.$servers)}`,
            children: state.$servers.map(servers => servers.length == 0 ? [ placeholder("Oh soo empty!", "You servers will be here when you create some!") ] : servers.map(server =>
                <RenderItem>{
                    id: server._id,
                    title: server.$name,
                    replacement: Grid(
                        Box().addClass(server.$state, "dot"),
                        BasicLabel({
                            title: server.$name,
                            subtitle: ref`${server.$type.map(it => serverTypes[ it ].name)} @ ${server.$state.map(it => it == "moving" ? "Moving to " : "")}${server.$location.map(it => locations[ it ] ?? "(no location)")}`
                        })
                            .addClass(isMobile.map(mobile => mobile ? "small" : "desktop"))
                            .addSuffix(server.$labels
                                .map(it => Grid(
                                    ...it
                                        .map(it => BasicLabel({ title: labels[ it ] }))
                                )
                                    .addClass("tag-node")
                                )
                                .asRefComponent()
                            )
                    )
                        .setRawColumns("max-content auto")
                        .setGap("1rem")
                        .setAlign("center"),
                    suffix: ChangeStateButton(server),
                    clickHandler: async () => {
                        await streamingPool();
                        if (!server.identifier)
                            startSidecarConnection(server._id);
                        // TODO wait until first data is showing to prevent blinking
                    },
                    children: [
                        ServerDetails(server),
                        {
                            id: "storage",
                            hidden: true,
                            title: "Storage",
                            children: [
                                {
                                    id: "database",
                                    title: "Manage Databases",
                                    subtitle: "Create a MariaDB Database",
                                    suffix: Label("Coming Soon")
                                        .setFont(1, 500)
                                        .setMargin("0 1rem")
                                },
                                {
                                    id: "assets",
                                    title: "Add Assets",
                                    subtitle: "Get new Plugins, Mods, and Datapacks",
                                    suffix: Label("Coming Soon")
                                        .setFont(1, 500)
                                        .setMargin("0 1rem")
                                },
                                FileBrowser()
                            ]
                        },
                        {
                            id: "audit-trail",
                            hidden: true,
                            title: "Audit Trail",
                            children: auditLogs
                        },
                        {
                            id: "settings",
                            hidden: true,
                            title: "Settings",
                            children: [
                                {
                                    id: "general",
                                    title: "General Settings",
                                    subtitle: "General Server Settings",
                                    clickHandler: () => editServerDialog(server)
                                },
                                {
                                    id: "core",
                                    title: "Server Settings",
                                    subtitle: "All your Settings in one place.",
                                    suffix: Label("Coming Soon")
                                        .setFont(1, 500)
                                        .setMargin("0 1rem")
                                },
                                {
                                    id: "delete",
                                    title: "Delete Server",
                                    subtitle: "Delete everything. Click once, gone forever.",
                                    clickHandler: () => deleteServerDialog(server._id)
                                }
                            ]
                        }
                    ]
                }
            ))
        },
        {
            id: "resources",
            title: "Resources",
            children: [
                state.$meta.map((meta) =>
                    meta ? profileView() : LoadingSpinner()
                ).asRefComponent()
            ]
        }
    ],
    children: [
        LoadingSpinner()
    ]
}).addClass(
    isMobile.map(mobile => mobile ? "mobile-navigation" : "navigation"),
    "limited-width"
);

hostingMenu.path.listen(path => {
    history.pushState(undefined, "", `/hosting?path=${path}`);
    if ([ "servers/", "resources/" ].includes(path)) {
        hostingButtons.setValue(
            [
                Button("Start new Server")
                    .setColor(state.$meta.map(meta => !meta || (meta.used.slots >= meta.limits.slots) ? Color.Disabled : Color.Grayscaled))
                    .onClick(() => {
                        location.href = "/hosting/create";
                    })
            ]
        );
        stopSidecarConnection();
    }
    else
        hostingButtons.setValue([]);
});


export function auditEntry(audit: any): RenderItem[] {
    return audit.map((x: any) => Entry(Grid(
        BasicLabel({
            title: `${auditLabels[ x.meta.action as AuditTypes ].replaceAll("$powerChange", x.meta.power ?? "")}`,
            subtitle: `Executed by ${x.user.profile.username}`
        }),
        Label(new Date(parseInt(x._id.substring(0, 8), 16) * 1000).toLocaleDateString())
    ))
        .addPrefix(showProfilePicture(x.user))
        .addClass("small"));
}
