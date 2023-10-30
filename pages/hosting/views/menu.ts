import { API, count, LoadingSpinner, Navigation, placeholder, RenderItem, SliderInput, stupidErrorAlert } from "shared";
import { deferred } from "std/async/deferred.ts";
import { format } from "std/fmt/bytes.ts";
import { asPointer, BasicLabel, BIcon, Box, Button, Color, Component, Custom, Dialog, DropDownInput, Entry, Form, Grid, IconButton, isMobile, Label, MediaQuery, MIcon, ref, refMerge, State, StateHandler, TextInput, Vertical } from "webgen/mod.ts";
import locations from "../../../data/locations.json" assert { type: "json" };
import serverTypes from "../../../data/servers.json" assert { type: "json" };
import { AuditTypes, Server, SidecarResponse } from "../../../spec/music.ts";
import { activeUser, showProfilePicture } from "../../_legacy/helper.ts";
import { MB, state } from "../data.ts";
import { currentDetailsTarget, downloadFile, isSidecarConnect, listFiles, messageQueueSidecar, sidecarDetailsSource, startSidecarConnection, stopSidecarConnection, streamingPool, uploadFile } from "../loading.ts";
import { profileView } from "../views/profile.ts";
import { ChangeStateButton } from "./changeStateButton.ts";
import { deleteServer } from "./deleteServer.ts";
import './details.css';
import { DropHandler } from "./dropHandler.ts";
import './fileBrowser.css';
import { FileEntry } from "./fileHandler.ts";
import { fileTypeName } from "./fileTypeName.ts";
import { mapFiletoIcon } from "./icon.ts";
import './list.css';
import { moveDialog } from "./list.ts";
import { pathNavigation } from "./pathNavigation.ts";
import { allFiles, auditLogs, canWriteInFolder, hostingButtons, loading, path, uploadingFiles } from "./state.ts";
import { createDownloadStream } from "./streamSaver.ts";
import './table2.css';
import { Table2 } from "./table2.ts";
import { TerminalComponent } from "./terminal.ts";
import { auditLabels, labels } from "./translation.ts";
import { GridItem } from "./types.ts";
import { calculateUptime } from "./uptime.ts";
import { DisconnectedScreen } from "./waitingScreen.ts";

const droppingFileHandler = async (files: ReadableStream<FileEntry>, count: number): Promise<void> => {
    if (!canWriteInFolder.getValue()) {
        alert("This folder is Read-only. You can't upload files here.");
        return;
    }
    console.log("Uploading", count, "files");
    for await (const _iterator of files) {
        await new Promise<void>((done) => {
            uploadFile(path.getValue() + _iterator.path, _iterator.file, (ratio) => {
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
                                        canWriteInFolder.map(writeable => writeable ? Box() : Box(
                                            MIcon("warning"),
                                            Label("This folder is Read-only. You can't upload files here.")
                                        ).addClass("read-only-path")).asRefComponent(),
                                        new Table2(allFiles)
                                            .addColumn("Name", (data) => Box(BIcon(mapFiletoIcon(data)), BasicLabel({ title: data.name }).addClass("small-text")).addClass("file-item"))
                                            .addColumn("Last Modified", (data) => data.lastModified !== undefined ? Label(new Date(data.lastModified).toLocaleString()) : Box())
                                            .addColumn("Type", (data) => data.fileMimeType !== undefined ? Label(fileTypeName(data.fileMimeType)) : Label("Folder"))
                                            .addColumn("Size", (data) => data.size !== undefined ? Label(format(parseInt(data.size))).addClass('text-align-right') : Box())
                                            .addColumn("", (data) => Grid(
                                                data.fileMimeType
                                                    ? IconButton(MIcon("file_open"), "Open file")
                                                        .addClass("table-button")
                                                        .onClick(() => {

                                                        })
                                                    : Box(),
                                                data.fileMimeType && data.size
                                                    ? IconButton(MIcon("download"), "Download")
                                                        .addClass("table-button")
                                                        .onClick(async () => {
                                                            const stream = downloadFile(path.getValue() + data.name);
                                                            await stream.pipeTo(createDownloadStream(data.name));
                                                        })
                                                    : Box(),
                                                data.fileMimeType
                                                    ? IconButton(MIcon("delete"), "Delete")
                                                        .addClass("table-button", "red")
                                                        .onClick(() => {

                                                        })
                                                    : Box()
                                            ).setEvenColumns(3))
                                            .setColumnTemplate("auto auto auto auto min-content")
                                            .setRowClickEnabled((rowIndex) => !allFiles.getValue()[ rowIndex ].fileMimeType)
                                            .setRowClick((rowIndex) => {
                                                const data = allFiles.getValue()[ rowIndex ];
                                                // Only folders
                                                path.setValue(`${path.getValue() + data.name}/`);
                                                loading.setValue(true);
                                                listFiles(path.getValue()).finally(() => loading.setValue(false));
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


    const uptime = BasicLabel({
        title: refMerge({
            state: server.$stateSince,
            time
        }).map(({ state, time }) => state ? calculateUptime(new Date(time)) : "---"),
        subtitle: server.$state.map(it => it == "running" ? "uptime" : "since"),
    });

    const address = BasicLabel({
        title: server.$address!.map(it => it ?? "---"),
        subtitle: "address",
    });

    const cpu = BasicLabel({
        title: ref`${input.$cpu.map(it => `${it?.toFixed(2) ?? "---"} %`)} / ${server.limits.cpu.toString()} %`,
        subtitle: "cpu",
    });
    const ram = BasicLabel({
        title: input.$memory.map(it => `${it ? format(it * MB) : "---"} / ${format(server.limits.memory * MB)}`),
        subtitle: "memory",
    });
    const disk = BasicLabel({
        title: input.$disk.map(it => it ? `${((it / server.limits.disk) * 100).toFixed(0)} %` : "---"),
        subtitle: "disk",
    });

    terminal.connected.listen(val => {
        if (val) {
            currentDetailsTarget.setValue(server._id);
            sidecarDetailsSource.setValue((data: SidecarResponse) => {
                if (data.type == "log") {
                    if (data.backlog)
                        terminal.reset();
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

    return isSidecarConnect.map((connected) => !server.identifier && !connected ? DisconnectedScreen() : isMobile.map(mobile => {
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
    }).asRefComponent()).asRefComponent();
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
