import { API, count, LoadingSpinner, Navigation, placeholder, RenderItem, stupidErrorAlert } from "shared/mod.ts";
import { calculateUptime } from "shared/uptime.ts";
import { debounce } from "std/async/debounce.ts";
import { delay } from "std/async/delay.ts";
import { WEEK } from "std/datetime/constants.ts";
import { asRef, asState, BasicLabel, Box, Button, Cache, Color, Empty, Entry, Grid, Image, isMobile, Label, MIcon, ref, refMerge, StateHandler, TextInput } from "webgen/mod.ts";
import { createCachedLoader, createIndexPaginationLoader } from "webgen/network.ts";
import { templateArtwork } from "../../../assets/imports.ts";
import locations from "../../../data/locations.json" with { type: "json" };
import serverTypes from "../../../data/servers.json" with { type: "json" };
import { AuditTypes, InstalledAddon, Server, ServerAudit, ServerTypes } from "../../../spec/music.ts";
import { activeUser, ProfileData, showProfilePicture } from "../../_legacy/helper.ts";
import { state } from "../data.ts";
import { installAddon, startSidecarConnection, stopSidecarConnection, uninstallAddon } from "../loading.ts";
import { collectDownloadList, getRealFiltered, ModrinthDownload } from "../modrinth.ts";
import { auditLabels, labels } from "../translation.ts";
import { profileView } from "../views/profile.ts";
import { ChangeStateButton } from "./changeStateButton.ts";
import './details.css';
import { deleteServerDialog } from "./dialogs/deleteServerDialog.ts";
import { editServerDialog } from "./dialogs/editServerDialog.ts";
import { forceRestartDialog } from "./dialogs/forceRestartDialog.ts";
import './fileBrowser.css';
import { FileBrowser } from "./FileBrowser.ts";
import { List } from "./List.ts";
import { Loader } from "./Loader.ts";
import './menu.css';
import { ServerDetails } from "./ServerDetails.ts";
import { auditLogs, hostingButtons } from "./state.ts";
import './table2.css';

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
                    suffix: server.labels.includes("maintenance") ? undefined : ChangeStateButton(server),
                    clickHandler: server.labels.includes("maintenance") ? undefined : () => {
                        startSidecarConnection(server._id);
                        // TODO wait until first data is showing to prevent blinking
                    },
                    children: server.labels.includes("maintenance") ? undefined : [
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
                                    clickHandler: async () => editServerDialog(server, await API.hosting.versions(server.type).then(stupidErrorAlert)).open()
                                },
                                {
                                    id: "core",
                                    title: "Server Settings",
                                    subtitle: "All your Settings in one place.",
                                    suffix: Label("Coming Soon")
                                        .setTextSize("xl")
                                        .setFontWeight("medium")
                                        .setMargin("0 1rem")
                                },
                                {
                                    id: "delete",
                                    title: "Delete Server",
                                    subtitle: "Delete everything. Click once, gone forever.",
                                    clickHandler: () => deleteServerDialog(server._id).open()
                                },
                                {
                                    id: "forcerestart",
                                    title: "Force Restart",
                                    subtitle: "Fully restarts your Instance. This could lead to data loss.",
                                    clickHandler: () => forceRestartDialog(server._id).open()
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

export const searchBox = asState({
    search: ""
});

searchBox.$search.listen(debounce(() => {
    const search = searchBox.search.trim();
    if (search === "") return;
    // TODO: Search for addons and add them to the list
}, 500));

export const installedAddons = asRef<InstalledAddon[]>([]);

function addonBrowser(server: StateHandler<Server>): RenderItem {
    const supported = [ ServerTypes.Default, ServerTypes.Fabric, ServerTypes.Forge ].includes(server.type);

    if (!supported)
        return {
            id: "assets",
            title: "Add Assets",
            subtitle: "Get new Plugins, Mods, and Datapacks",
            suffix: Label("(Recommended Only)")
                .setTextSize("xl")
                .setFontWeight("medium")
                .setMargin("0 1rem")
        };

    const loader = createCachedLoader(createIndexPaginationLoader({
        limit: 80,
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
                ({ items, hasMore, loadMore }) => Grid(
                    List(
                        refMerge({
                            items,
                            searchString: searchBox.$search
                        })
                            .map(({ items, searchString }) => items.filter(it => it.title.toLowerCase().includes(searchString.toLowerCase()))),
                        it => it.slug,
                        addon => Entry({
                            title: addon.title,
                            subtitle: addon.description,
                        })
                            .addPrefix(
                                Cache
                                    (`${addon.slug}:${addon.icon_url}`,
                                        undefined,
                                        () => Image(addon.icon_url || templateArtwork, `Image of ${addon.title}`)
                                            .setWidth("100px")
                                    )
                            )
                            .addSuffix(
                                Grid(
                                    Grid(
                                        MIcon("cloud_download"),
                                        Label(addon.downloads.toString())
                                    )
                                        .addClass("addon-stats")
                                        .setRawColumns("max-content max-content"),
                                    Cache<ModrinthDownload | undefined>(addon.slug, () => addon.download, (type, val) => {
                                        if (type === "cache")
                                            return Button("Loading...")
                                                .setColor(Color.Disabled);

                                        if (val === undefined)
                                            return Button("Not Available")
                                                .setColor(Color.Disabled);

                                        return installedAddons.map(it => !it.find(it => it.projectId === addon.project_id)).map(installed => installed
                                            ? Button("Add to Server")
                                                .onPromiseClick(async () => {
                                                    const downloadList = await collectDownloadList([ server.version ], server.type, val.project_id);
                                                    await installAddon(downloadList);
                                                    await delay(1000);
                                                    installedAddons.setValue([ ...installedAddons.getValue(), ...downloadList ]);
                                                })
                                            : Button("Uninstall")
                                                .addClass("danger-button")
                                                .onPromiseClick(async () => {
                                                    await uninstallAddon(addon.project_id);
                                                    await delay(1000);
                                                    installedAddons.setValue(installedAddons.getValue().filter(it => it.projectId !== addon.project_id));
                                                })
                                        ).asRefComponent();
                                    }).removeFromLayout(),
                                    Grid(
                                        MIcon("update"),
                                        Label(calculateUptime(new Date(addon.date_modified)))
                                    )
                                        .addClass(new Date(addon.date_modified).getTime() > (Date.now() - 15 * WEEK) ? "up-top-date" : "outdated")
                                        .addClass("addon-stats")
                                        .setRawColumns("max-content max-content")

                                )
                                    .addClass("addon-buttons")
                                    .setMargin("0 0 0 1rem")
                            )
                    ),
                    hasMore.map(it => it
                        ? Grid(
                            Button("Load More")
                                .setMargin("var(--gap) 0 0")
                                .onPromiseClick(() => loadMore())
                        )
                            .setJustify("center")
                        : Empty()
                    ).asRefComponent()
                ).setGap()
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