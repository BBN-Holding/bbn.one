import { API, count, HeavyReRender, LoadingSpinner, Navigation, placeholder, RenderItem, SliderInput, stupidErrorAlert } from "shared";
import { deferred } from "std/async/deferred.ts";
import { format } from "std/fmt/bytes.ts";
import { dirname } from "std/path/mod.ts";
import { asPointer, BasicLabel, BIcon, Box, Button, ButtonStyle, Color, Component, Custom, Dialog, DropDownInput, Entry, Form, Grid, IconButton, IconButtonComponent, isMobile, Label, loadingWheel, MediaQuery, MIcon, ref, refMerge, State, StateHandler, TextInput, Vertical } from "webgen/mod.ts";
import locations from "../../../data/locations.json" assert { type: "json" };
import serverTypes from "../../../data/servers.json" assert { type: "json" };
import { AuditTypes, PowerState, Server, SidecarResponse } from "../../../spec/music.ts";
import { activeUser, showProfilePicture } from "../../_legacy/helper.ts";
import { MB, state } from "../data.ts";
import { currentDetailsTarget, currentFiles, currentPath, isSidecarConnect, listFiles, messageQueueSidecar, RemotePath, sidecarDetailsSource, startSidecarConnection, stopSidecarConnection, streamingPool, uploadFile } from "../loading.ts";
import { profileView } from "../views/profile.ts";
import './details.css';
import { DropHandler } from "./dropHandler.ts";
import './fileBrowser.css';
import { FileEntry } from "./fileHandler.ts";
import { fileTypeName } from "./fileTypeName.ts";
import { mapFiletoIcon } from "./icon.ts";
import './list.css';
import { moveDialog } from "./list.ts";
import './table2.css';
import { Table2 } from "./table2.ts";
import { TerminalComponent } from "./terminal.ts";
import { GridItem } from "./types.ts";
import { calculateUptime } from "./uptime.ts";
type StateActions = {
    [ type in PowerState ]: Component | IconButtonComponent;
};

const labels = {
    legacy: "Legacy",
    suspended: "Suspended",
    "contact-support": "Contact Support"
} satisfies Record<Server[ "labels" ][ number ], string>;

const auditLabels = {
    "server-create": "Server Created",
    "server-delete": "Server Deleted",
    "server-modify": "Server Specs Updated",
    "server-power-change": "Power changed to $powerChange",
    "store-purchase": "Purchased $storeItem in store",
    "file-upload": "File Uploaded",
    "file-delete": "File Deleted",
    "file-read": "File Read",
    "command-execute": "Command Executed",
} satisfies Record<AuditTypes, string>;

export const hostingButtons = asPointer(<Component[]>[]);
export const auditLogs = asPointer(<RenderItem[]>[]);

const uploadingFiles = asPointer(<Record<string, number | "failed">>{});

const allFiles = refMerge({
    uploadingFiles: uploadingFiles
        .map(files => Object.entries(files)
            .filter(([ path ]) => dirname(path) === currentPath.getValue())
            .map(([ name, uploadingRatio ]) => (<RemotePath>{ name, uploadingRatio }))
        ),
    currentFiles: currentFiles.map(it => {
        const { compare } = new Intl.Collator();
        return Array.from(it).sort((a, b) => compare(a.name, b.name)).sort((a, b) => Number(!!a.fileMimeType) - Number(!!b.fileMimeType));

    })
}).map(({ currentFiles, uploadingFiles }) => [ ...uploadingFiles, ...currentFiles ]);

const path = asPointer("");
const loading = asPointer(false);
const droppingFileHandler = async (files: ReadableStream<FileEntry>, count: number): Promise<void> => {
    console.log("Uploading", count, "files");
    for await (const _iterator of files) {
        await new Promise<void>((done) => {
            uploadFile(path.getValue() + _iterator.path, _iterator.file, (ratio) => {
                console.log(_iterator.path, ratio);
                uploadingFiles.setValue({
                    ...uploadingFiles.getValue(),
                    [ `/${_iterator.path}` ]: ratio
                });
                if (ratio >= 1) {
                    done();
                }
            });
        });
        uploadingFiles.setValue(Object.fromEntries(Object.entries(uploadingFiles.getValue()).filter(([ path ]) => path != _iterator.path)));
    }
};
export const hostingMenu = Navigation({
    title: ref`Hi ${activeUser.$username} 👋`,
    actions: hostingButtons,
    categories: [
        {
            id: "servers",
            title: ref`Servers ${count(state.$servers)}`,
            children: state.$servers.map(servers => servers.length == 0 ? [ placeholder("Oh soo empty!", "You servers will be here when you create some!") ] : servers.map(server =>
            (<RenderItem>{
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
                    serverDetails(server),
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
                                subtitle: "Get new Plugins, Mods and Datapacks",
                                suffix: Label("Coming Soon")
                                    .setFont(1, 500)
                                    .setMargin("0 1rem")
                            },
                            DropHandler(
                                droppingFileHandler,
                                Grid(
                                    Entry(Grid(
                                        BasicLabel({
                                            title: "File Browser",
                                            subtitle: "Drag and Drop files/folders here to upload and download them faster."
                                        }).setMargin("0 0 1rem 0"),
                                        pathNavigation(),
                                        new Table2(allFiles)
                                            .addColumn("Name", (data) => Box(BIcon(mapFiletoIcon(data)), BasicLabel({ title: data.name }).addClass("small-text")).addClass("file-item"))
                                            .addColumn("Last Modified", (data) => data.lastModified !== undefined ? Label(new Date(data.lastModified).toLocaleString()) : Box())
                                            .addColumn("Type", (data) => data.fileMimeType !== undefined ? Label(fileTypeName(data.fileMimeType)) : Label("Folder"))
                                            .addColumn("Size", (data) => data.size !== undefined ? Label(format(parseInt(data.size))).addClass('text-align-right') : Box())
                                            .setRowClick((rowIndx) => {
                                                const data = allFiles.getValue()[ rowIndx ];
                                                if (data.fileMimeType === undefined) {
                                                    path.setValue(`${path.getValue() + data.name}/`);
                                                    loading.setValue(true);
                                                    listFiles(path.getValue()).finally(() => loading.setValue(false));
                                                } else {
                                                    Dialog(() => Label(JSON.stringify(data))).setTitle("File Info").allowUserClose().open();
                                                }
                                            })
                                    )).addClass("file-browser")
                                ),
                            ).addClass("drop-area")
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
                                clickHandler: () => editServer(server)
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
                                clickHandler: () => deleteServer(server._id)
                            }
                        ]
                    }
                ]
            })
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

state.$loaded.listen(loaded => {
    if (loaded)
        hostingMenu.path.setValue((state.servers.length == 0 ? 'resources/' : 'servers/'));
    else
        hostingMenu.path.setValue("-/");
});

hostingMenu.path.listen(path => {
    if ([ "servers/", "resources/", "legacy-servers/" ].includes(path)) {
        hostingButtons.setValue(
            [
                Button("Start new Server")
                    .setColor(state.$meta.map(() => !state.meta || (state.meta.used.slots >= state.meta.limits.slots) ? Color.Disabled : Color.Grayscaled))
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


function pathNavigation(): Component | [ settings: { width?: number | undefined; heigth?: number | undefined; }, element: Component ] {
    return path.map(list => Grid(
        ...list.split("/").filter((_, index, list) => (list.length - 1) != index).map((item, currentIndex, list) => Button(item || 'home')
            .setStyle(ButtonStyle.Secondary)
            .onClick(() => {
                path.setValue([ ...list.filter((_, listIndex) => listIndex <= currentIndex), '' ].join("/"));
                loading.setValue(true);
                listFiles(path.getValue()).finally(() => loading.setValue(false));
            })),
        Box(Custom(loadingWheel() as Element as HTMLElement)).addClass(loading.map(it => it ? "loading" : "non-loading"), "loading-box")
    ).setJustify("start").addClass("path-bar")).asRefComponent().removeFromLayout();
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

function ChangeStateButton(server: StateHandler<Server>): Component {
    return server.$state.map((state) => ((<StateActions>{
        "offline": IconButton(MIcon("play_arrow"), "delete")
            .addClass("color-green")
            .setColor(Color.Colored)
            .onClick((e) => {
                e.stopPropagation();
                startSidecarConnection(server._id);
                const promise = deferred<any>();
                messageQueueSidecar.push({
                    request: {
                        type: "state",
                        state: "start"
                    },
                    response: promise // Maybe we can use this to show a different loading spinner until the server is starting
                });
                promise.then(() => {
                    stopSidecarConnection();
                });
                // This actually works when we a have better change stream system
                server.state = "starting";
            }),
        // TODO: make this better (labels or something)
        "installing": LoadingSpinner(),
        "stopping": LoadingSpinner(),
        "starting": LoadingSpinner(),
        "running": IconButton(MIcon("stop"), "delete")
            .setColor(Color.Critical)
            .onClick((e) => {
                e.stopPropagation();
                server.state = "stopping";
                startSidecarConnection(server._id);
                const promise = deferred<any>();
                messageQueueSidecar.push({
                    request: {
                        type: "state",
                        state: "stop"
                    },
                    response: promise
                });
                promise.then(() => {
                    stopSidecarConnection();
                });
            })
    })[ state ] ?? Box()))
        .asRefComponent()
        .addClass(isMobile.map(it => it ? "small" : "normal"), "icon-buttons-list", "action-list");
}

const time = asPointer(new Date().getTime());
setInterval(() => time.setValue(new Date().getTime()), 200);

export function serverDetails(server: StateHandler<Server>) {
    const terminal = new TerminalComponent();

    const input = State({
        cpu: <number | undefined>undefined,
        memory: <number | undefined>undefined,
        disk: <number | undefined>undefined,
        message: ""
    });


    const uptime = HeavyReRender(time, () => BasicLabel({
        title: server.$stateSince.map(it => it ? calculateUptime(new Date(it)) : "---"),
        subtitle: server.$state.map(it => it == "running" ? "uptime" : "since"),
    }));

    const address = BasicLabel({
        title: server.$address!.map(it => it ?? "---"),
        subtitle: "address",
    });

    const cpu = BasicLabel({
        title: ref`${input.$cpu.map(it => `${it?.toFixed(2) ?? "---"} %`)} / ${server.limits.cpu.toString()} %`,
        subtitle: "cpu",
    });
    const ram = BasicLabel({
        title: input.$memory.map(it => `${it ? format(it * MB) : "0 MB"} / ${format(server.limits.memory * MB)}`),
        subtitle: "memory",
    });
    const disk = BasicLabel({
        title: input.$disk.map(it => it ? `${((it / server.limits.disk) * 100).toFixed(0)} % (${format(it*MB)} / ${format(server.limits.disk*MB)})` : "---"),
        subtitle: "disk",
    });

    terminal.connected.listen(val => {
        if (val) {
            currentDetailsTarget.setValue(server._id);

            sidecarDetailsSource.setValue((data: SidecarResponse | "clear") => {
                if (data === "clear") {
                    terminal.reset();
                    return;
                }
                if (data.type == "log") {
                    terminal.write(data.chunk);
                }
                if (data.type == "stats") {
                    input.cpu = data.stats.cpu;
                    input.memory = data.stats.memory;
                    input.disk = data.stats.disk;
                }
            });
        }
    });

    return isSidecarConnect.map((connected) => !server.identifier && !connected ? DisconnectedScreen() : HeavyReRender(isMobile, mobile => {
        const items = Grid(
            ...(mobile ? <Component[]>[
                Entry(Grid(
                    ChangeStateButton(server),
                    uptime
                ))
                    .addClass("stats-list"),
                Entry(Grid(
                    address
                ))
                    .addClass("stats-list"),
                Entry(Grid(
                    cpu,
                    ram,
                    disk
                ))
                    .addClass("stats-list")
            ] : <GridItem[]>[
                [
                    { width: 2 },
                    Entry(Grid(
                        ChangeStateButton(server),
                        uptime,
                        address,
                        cpu,
                        ram,
                        disk
                    ))
                        .addClass("stats-list")
                ]
            ]),
            Entry(
                Grid(
                    Box(Custom(terminal).addClass("terminal-window")).removeFromLayout(),
                    Form(Grid(
                        TextInput("text", "Send a Command")
                            .sync(input, "message"),
                        Button("Send")
                            .setId("submit-button")
                            .onClick(() => {
                                messageQueueSidecar.push({
                                    request: {
                                        type: "command",
                                        command: input.message
                                    },
                                    response: deferred()
                                });
                                input.message = "";
                            })
                    )
                        .setRawColumns("auto max-content")
                        .setGap(".5rem"))
                        .activeSubmitTo("#submit-button")
                ).addClass("internal-grid")
            ).addClass("terminal-card"),
            server.identifier ? Grid(
                Entry({
                    title: "Settings",
                    subtitle: "Update your Server"
                }).onClick(() => {
                    editServer(server);
                }).addClass("small"),
                Entry({
                    title: "Audit Trail",
                    subtitle: "Keep track of what's going on",
                }).onClick(async () => {
                    const audit = await API.hosting.serverId(server._id).audit().then(stupidErrorAlert);
                    auditLogs.setValue(auditEntry(audit));
                    hostingMenu.path.setValue(`${hostingMenu.path.getValue()}/audit-trail/`);
                }).addClass("small"),
                Entry({
                    title: "Legacy",
                    subtitle: "Go to the legacy panel"
                }).onClick(() => open(`https://panel.bbn.one/server/${server.identifier}`, "_blank"))
                    .addClass("small")
            )
                .addClass("split-list")
                .setGap("var(--gap)")
                : Grid(
                    Entry({
                        title: "Storage",
                        subtitle: "Manage your persistence",
                    }).onClick(async () => {
                        await listFiles("/");
                        path.setValue("/");
                        hostingMenu.path.setValue(`${hostingMenu.path.getValue()}/storage/`);
                    }).addClass("small"),
                    Entry({
                        title: "Audit Trail",
                        subtitle: "Keep track of what's going on",
                    }).onClick(async () => {
                        const audit = await API.hosting.serverId(server._id).audit().then(stupidErrorAlert);
                        auditLogs.setValue(auditEntry(audit));
                        hostingMenu.path.setValue(`${hostingMenu.path.getValue()}/audit-trail/`);
                    }).addClass("small"),
                    Entry({
                        title: "Sub-User",
                        subtitle: "Add friends to manage your server",
                    }).onClick(async () => {
                        const audit = await API.hosting.serverId(server._id).audit().then(stupidErrorAlert);
                        auditLogs.setValue(auditEntry(audit));
                        hostingMenu.path.setValue(`${hostingMenu.path.getValue()}/audit-trail/`);
                    }).addClass("small"),
                    Entry({
                        title: "Settings",
                        subtitle: "Update your Server"
                    }).onClick(() => {
                        hostingMenu.path.setValue(`${hostingMenu.path.getValue()}/settings/`);
                    }).addClass("small")
                )
                    .addClass("split-list")
                    .setGap("var(--gap)")
        )
            .setGap("var(--gap)");

        if (!mobile)
            items.setRawColumns("69% auto");

        return items;
    })).asRefComponent();
}

function DisconnectedScreen(): Component {
    return Grid(
        Grid(
            Label("Connecting to server...", "h1"),
            Label("Waiting for server availability")
        ).setJustify("center")
    ).addClass("disconnected-screen");
}

function editServer(server: StateHandler<Server>) {
    const data = State({
        name: server.name,
        memory: server.limits.memory,
        disk: server.limits.disk,
        cpu: server.limits.cpu,
        location: server.location,
    });
    Dialog(() =>
        Vertical(
            Label(`A ${serverTypes[ server.type ].name} Server.`),
            MediaQuery("(max-width: 700px)", (small) => Grid(
                [
                    {
                        width: small ? 1 : 2
                    },
                    TextInput("text", "Friendly Name")
                        .sync(data, "name")
                ],
                DropDownInput("Location", Object.keys(locations))
                    .setColor(server.identifier ? Color.Disabled : Color.Grayscaled)
                    .setRender(location => locations[ location as keyof typeof locations ])
                    .sync(data, "location"),
                SliderInput("Memory (RAM)")
                    .setMin(1)
                    .setMax(state.meta.limits.memory - state.meta.used.memory + server.limits.memory)
                    .sync(data, "memory")
                    .setRender((val) => format(val * MB)),
                SliderInput("Disk (Storage)")
                    .setMin(server.identifier ? 1 : server.limits.disk)
                    .setMax(state.meta.limits.disk - state.meta.used.disk + server.limits.disk)
                    .sync(data, "disk")
                    .setRender((val) => format(val * MB)),
                SliderInput("CPU (Processor)")
                    .setMin(1)
                    .setMax(state.meta.limits.cpu - state.meta.used.cpu + server.limits.cpu)
                    .sync(data, "cpu")
                    .setRender((val) => `${val.toString()} %`),

            )
                .setGap("var(--gap)")
                .setEvenColumns(small ? 1 : 3)
            ).removeFromLayout()
        )
            .setGap("var(--gap)")
    )
        .setTitle(`Edit '${server.name}'`)
        .allowUserClose()
        .addButton("Delete Server", () => {
            deleteServer(server._id);
            return "remove";
        }, Color.Critical)
        .addButton("Close", "remove")
        .addButton("Save", async () => {
            if (data.location != server.location)
                moveDialog(data.name, server.location, data.location);

            await API.hosting.serverId(server._id)
                .edit(data)
                .then(stupidErrorAlert);

            location.reload();
            return "remove" as const;
        })
        .open();
}

function deleteServer(serverId: string) {
    Dialog(() => Box(Label("Deleting this Server, will result in data loss.\nAfter this point there is no going back.")).setMargin("0 0 1.5rem"))
        .setTitle("Are you sure?")
        .addButton("Cancel", "remove")
        .addButton("Delete", async () => {
            await API.hosting.serverId(serverId).delete()
                .then(stupidErrorAlert)
                .catch(() => { });
            location.href = "/hosting";
            return "remove" as const;
        }, Color.Critical)
        .allowUserClose()
        .open();
}