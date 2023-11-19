import { API, count, LoadingSpinner, Navigation, placeholder, RenderItem, stupidErrorAlert } from "shared";
import { deferred } from "std/async/deferred.ts";
import { asPointer, BasicLabel, Box, Button, Color, Entry, Grid, isMobile, Label, ref } from "webgen/mod.ts";
import locations from "../../../data/locations.json" assert { type: "json" };
import serverTypes from "../../../data/servers.json" assert { type: "json" };
import { Addon, AuditTypes, SidecarResponse } from "../../../spec/music.ts";
import { activeUser, showProfilePicture } from "../../_legacy/helper.ts";
import { state } from "../data.ts";
import { messageQueueSidecar, startSidecarConnection, stopSidecarConnection } from "../loading.ts";
import { profileView } from "../views/profile.ts";
import { ChangeStateButton } from "./changeStateButton.ts";
import './details.css';
import { deleteServerDialog } from "./dialogs/deleteServerDialog.ts";
import { editServerDialog } from "./dialogs/editServerDialog.ts";
import { forceRestartDialog } from "./dialogs/forceRestartDialog.ts";
import './fileBrowser.css';
import { FileBrowser } from "./FileBrowser.ts";
import './menu.css';
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
                            subtitle: ref`${server.$type.map(it => serverTypes[ it ].name)} @ ${server.$location.map(it => locations[ it ])}`
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
                    clickHandler: () => {
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
                                    title: "Manage Assets",
                                    subtitle: "Get new Plugins, Mods, and Datapacks",
                                    suffix: Label("Coming Soon")
                                        .setFont(1, 500)
                                        .setMargin("0 1rem")
                                },
                                // server.type !== ServerTypes.Default ?
                                //     {
                                //         id: "assets",
                                //         title: "Add Assets",
                                //         subtitle: "Get new Plugins, Mods, and Datapacks",
                                //         suffix: Label("(Recommended Only)")
                                //             .setFont(1, 500)
                                //             .setMargin("0 1rem")
                                //     } : {
                                //         id: "assets",
                                //         title: "Add Assets",
                                //         subtitle: "Get new Plugins, Mods, and Datapacks",
                                //         clickHandler: async () => {
                                //             addons.setValue(await fetchPlugins());
                                //         },
                                //         children: addons.map(addonList => addonList.length == 0
                                //             ? [ placeholder("Oh soo empty!", "You addons will be here when you add some!") ]
                                //             : [
                                //                 addonList
                                //                     .filter((_, index) => (index + 1) % 20 != 0)
                                //                     .map(plugin => (<RenderItem>{
                                //                         id: plugin.id ?? plugin.name,
                                //                         title: plugin.name,
                                //                         subtitle: plugin.description,
                                //                         replacement: Grid(
                                //                             Image(plugin.icon, `Image of ${plugin.name}`),
                                //                             BasicLabel({
                                //                                 title: plugin.name,
                                //                                 subtitle: plugin.description,
                                //                             })
                                //                         )
                                //                             .setAlign("center")
                                //                             .setRawColumns("100px auto")
                                //                             .setGap("25px"),
                                //                         suffix: Grid(
                                //                             Grid(
                                //                                 MIcon("cloud_download"),
                                //                                 Label(plugin.downloads.toString())
                                //                             )
                                //                                 .addClass("addon-stats")
                                //                                 .setRawColumns("max-content max-content"),
                                //                             Button("Add to Server"),
                                //                             Grid(
                                //                                 // last upload
                                //                                 MIcon("update"),
                                //                                 Label(calculateUptime(new Date(plugin.lastUpdated)))
                                //                             )
                                //                                 .addClass(new Date(plugin.lastUpdated).getTime() > (Date.now() - 15 * WEEK) ? "up-top-date" : "outdated")
                                //                                 .addClass("addon-stats")
                                //                                 .setRawColumns("max-content max-content"),
                                //                         ).addClass("addon-buttons"),
                                //                     })),
                                //                 // Add a load more button when there is more available then displayed. Loading happens 21-offset based while only 20 are displayed.
                                //                 addonList.length % 20 !== 0 && !emptyResponse.getValue() ? Box(Button("Load More").onPromiseClick(async () => {
                                //                     await delay(1000);
                                //                     const data = await fetchPlugins(addonList.length - 1);
                                //                     console.log(data);
                                //                     if (!data) return;
                                //                     if (data.length == 0) {
                                //                         emptyResponse.setValue(true);
                                //                         return;
                                //                     }
                                //                     addons.setValue([ ...addonList, ...data ]);
                                //                 })) : Box().removeFromLayout()
                                //             ].flat())
                                //     },
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
                                    clickHandler: async () => editServerDialog(server, await API.hosting.versions(server.type).then(stupidErrorAlert))
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
                                },
                                {
                                    id: "forcerestart",
                                    title: "Force Restart",
                                    subtitle: "Force a restart of your server. Sometimes even the best servers need a restart.",
                                    clickHandler: () => forceRestartDialog(server._id)
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

state.$meta.listen(() =>
    hostingMenu.path.listen(path => {
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
    })
);

let firstRouteChange = false;
hostingMenu.path.listen(path => {
    if (!firstRouteChange) return firstRouteChange = true;
    history.pushState(undefined, "", `/hosting?path=${path}`);
});

export const addons = asPointer<Addon[]>([]);
export const emptyResponse = asPointer<boolean>(false);

async function fetchPlugins(offset = 0) {
    const response = deferred<SidecarResponse>();
    messageQueueSidecar.push({
        request: {
            type: "addons",
            offset,
        },
        response: response
    });
    const rsp = await response;
    if (rsp.type == "addons") {
        return rsp.addons;
    }
}

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
