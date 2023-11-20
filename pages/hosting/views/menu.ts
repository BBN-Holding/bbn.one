import { API, count, LoadingSpinner, Navigation, placeholder, RenderItem, stupidErrorAlert } from "shared";
import { WEEK } from "std/datetime/constants.ts";
import { BasicLabel, Box, Button, Cache, Color, Entry, Grid, Image, isMobile, Label, MIcon, ref, refMerge, State, StateHandler, TextInput } from "webgen/mod.ts";
import { createCachedLoader, createIndexPaginationLoader } from "webgen/network.ts";
import locations from "../../../data/locations.json" assert { type: "json" };
import serverTypes from "../../../data/servers.json" assert { type: "json" };
import { AuditTypes, Server, ServerAudit, ServerTypes } from "../../../spec/music.ts";
import { activeUser, ProfileData, showProfilePicture } from "../../_legacy/helper.ts";
import { state } from "../data.ts";
import { startSidecarConnection, stopSidecarConnection } from "../loading.ts";
import { getRealFiltered } from "../modrinth.ts";
import { profileView } from "../views/profile.ts";
import { ChangeStateButton } from "./changeStateButton.ts";
import './details.css';
import { deleteServerDialog } from "./dialogs/deleteServerDialog.ts";
import { editServerDialog } from "./dialogs/editServerDialog.ts";
import { forceRestartDialog } from "./dialogs/forceRestartDialog.ts";
import './fileBrowser.css';
import { FileBrowser } from "./FileBrowser.ts";
import { Loader } from "./Loader.ts";
import './menu.css';
import { ServerDetails } from "./ServerDetails.ts";
import { auditLogs, hostingButtons } from "./state.ts";
import './table2.css';
import { auditLabels, labels } from "./translation.ts";
import { calculateUptime } from "./uptime.ts";

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
                                addonBrowser(server),
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

export const searchBox = State({
    search: ""
});

function addonBrowser(server: StateHandler<Server>): RenderItem {
    const supported = [ ServerTypes.Default, ServerTypes.Fabric, ServerTypes.Forge ].includes(server.type);

    if (!supported)
        return {
            id: "assets",
            title: "Add Assets",
            subtitle: "Get new Plugins, Mods, and Datapacks",
            suffix: Label("(Recommended Only)")
                .setFont(1, 500)
                .setMargin("0 1rem")
        };

    const loader = createCachedLoader(createIndexPaginationLoader({
        limit: 30,
        loader: (offset, limit) => getRealFiltered([ server.version ], server.type, offset, limit),
    }));
    return {
        id: "assets",
        title: "Add Assets",
        subtitle: "Get new Plugins, Mods, and Datapacks",
        clickHandler: async () => {
            loader.reset();
            await loader.next();
        },
        children: [
            Grid(
                TextInput("text", "Search")
                    .sync(searchBox, "search"),
            ).setJustify("end"),
            Loader(
                loader,
                ({ items, hasMore, loadMore }) =>
                    refMerge({
                        items: items,
                        searchString: searchBox.$search,
                        hasMore
                    })
                        .map(({ items, hasMore, searchString }) => ({
                            items: items.filter(it => it.title.toLowerCase().includes(searchString.toLowerCase())),
                            hasMore
                        }))
                        .map(({ items, hasMore }) => items.length == 0
                            ? placeholder("Oh soo empty!", "We probably couldn't find find anything matching your search.")
                            : Grid(...items.map(addon =>
                                Entry({
                                    title: addon.title,
                                    subtitle: addon.description,
                                })
                                    .addPrefix(
                                        Cache
                                            (`${addon.slug}:${addon.icon_url}`,
                                                undefined,
                                                () => Image(addon.icon_url, `Image of ${addon.title}`)
                                                    .setWidth("100px")
                                            )
                                    )
                                    .addSuffix(
                                        Cache(addon.slug, () => addon.download, (type, val) => {
                                            if (type === "cache")
                                                return Label("Loading");

                                            if (val === undefined)
                                                return Button("Not Available")
                                                    .setColor(Color.Disabled);

                                            return Grid(
                                                Grid(
                                                    MIcon("cloud_download"),
                                                    Label(addon.downloads.toString())
                                                )
                                                    .addClass("addon-stats")
                                                    .setRawColumns("max-content max-content"),
                                                Button("Add to Server"),
                                                Grid(
                                                    MIcon("update"),
                                                    Label(calculateUptime(new Date(addon.date_modified)))
                                                )
                                                    .addClass(new Date(addon.date_modified).getTime() > (Date.now() - 15 * WEEK) ? "up-top-date" : "outdated")
                                                    .addClass("addon-stats")
                                                    .setRawColumns("max-content max-content")
                                            ).addClass("addon-buttons").setMargin("0 0 0 1rem");
                                        })
                                    )

                            ),
                                hasMore ? Grid(
                                    Button("Load More")
                                        .onPromiseClick(() => loadMore())
                                )
                                    .setJustify("center")
                                    : Box().removeFromLayout()
                            )
                                .setGap()
                        ).asRefComponent()
            )
        ]
    };
}

export function auditEntry(audit: ServerAudit[]): RenderItem[] {
    return audit.map((x) => Entry(Grid(
        BasicLabel({
            title: `${auditLabels[ x.meta.action ].replaceAll("$powerChange", x.meta.action === AuditTypes.ServerPowerChange ? x.meta.power ?? "" : "")}`,
            subtitle: `Executed by ${x.user.profile.username}`
        }),
        Label(new Date(parseInt((x._id ?? x.id).substring(0, 8), 16) * 1000).toLocaleDateString())
    ))
        .addPrefix(showProfilePicture(x.user as ProfileData))
        .addClass("small"));
}