import { readableStreamFromIterable } from "https://deno.land/std@0.200.0/streams/readable_stream_from_iterable.ts";
import { MessageType } from "https://deno.land/x/hmsys_connector@0.9.0/spec/ws.ts";
import { API, count, HeavyReRender, LoadingSpinner, Navigation, placeholder, RenderItem, SliderInput, stupidErrorAlert } from "shared";
import { sumOf } from "std/collections/sum_of.ts";
import { format } from "std/fmt/bytes.ts";
import { dirname } from "std/path/mod.ts";
import { asPointer, BasicLabel, BIcon, Box, Button, ButtonStyle, Color, Component, Custom, Dialog, DropDownInput, Entry, Form, Grid, IconButton, IconButtonComponent, isMobile, Label, loadingWheel, MediaQuery, MIcon, Pointable, Pointer, ref, State, StateHandler, TextInput, Vertical } from "webgen/mod.ts";
import locations from "../../../data/locations.json" assert { type: "json" };
import serverTypes from "../../../data/servers.json" assert { type: "json" };
import { AuditTypes, PowerState, Server, ServerDetails } from "../../../spec/music.ts";
import { activeUser, showProfilePicture } from "../../_legacy/helper.ts";
import { MB, state } from "../data.ts";
import { currentDetailsSource, currentDetailsTarget, currentFiles, currentPath, listFiles, messageQueue, RemotePath, startSidecarConnection, streamingPool, uploadFile } from "../loading.ts";
import { profileView } from "../views/profile.ts";
import './details.css';
import './fileBrowser.css';
import { countFileTree, FileEntry, getFileStream } from "./fileHandler.ts";
import './list.css';
import { moveDialog } from "./list.ts";
import './table2.css';
import { TerminalComponent } from "./terminal.ts";
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
    "store-purchase": "Purchased $storeItem in store"
} satisfies Record<AuditTypes, string>;

export const hostingButtons = asPointer(<Component[]>[]);
export const auditLogs = asPointer(<RenderItem[]>[]);

const supportsFileSystemAccessAPI =
    'getAsFileSystemHandle' in DataTransferItem.prototype;
const supportsWebkitGetAsEntry =
    'webkitGetAsEntry' in DataTransferItem.prototype;

export function DropHandler(onData: (data: ReadableStream<FileEntry>, length: number) => void, component: Component) {
    return new class extends Component {
        hovering = asPointer(false);
        constructor() {
            super();
            this.addClass(this.hovering.map(it => it ? "hovering" : "default"), "drop-area");
            this.wrapper.ondragover = (ev) => {
                ev.preventDefault();
                this.hovering.setValue(true);
            };
            this.wrapper.ondragleave = (ev) => {
                ev.preventDefault();
                console.log(ev);
                if (ev.target && !this.wrapper.contains(ev.relatedTarget as Node))
                    this.hovering.setValue(false);
            };
            this.wrapper.ondrop = async (ev) => {
                ev.preventDefault();
                if (!supportsFileSystemAccessAPI) {
                    alert("Please upgrade you Browser to use the latest features");
                    return;
                }
                if (!supportsFileSystemAccessAPI && !supportsWebkitGetAsEntry || !ev.dataTransfer) return;

                this.hovering.setValue(false);
                const files = await Promise.all([ ...ev.dataTransfer.items ]
                    .filter(item => item.kind === 'file') // File means file or directory
                    .map(item => item.getAsFileSystemHandle()));

                const fileSizeCount = sumOf(await Promise.all(files.filter(it => it).map(it => countFileTree(it!))), it => it);

                onData?.(readableStreamFromIterable(files)
                    .pipeThrough(new TransformStream<FileSystemHandle | null, FileEntry>({
                        async transform(chunk, controller) {
                            if (!chunk) return;
                            for await (const iterator of getFileStream(chunk)) {
                                controller.enqueue(iterator);
                            }
                        }
                    })), fileSizeCount);
            };
            this.wrapper.append(component.draw());
        }
    };
}

const uploadingFiles = asPointer(<Record<string, number | "failed">>{});

type TableColumn<Data> = {
    size: 'fill' | 'auto',
    converter: (data: Data) => Component;
    title: Pointer<string>;
    sorting: Pointer<TableSorting | undefined>;
};

enum TableSorting {
    Descending = "descending",
    Ascending = "ascending",
    Available = "available"
}

type RowClickHandler = (rowIndex: number, columnIndex: number) => void;

export class Table2<Data> extends Component {
    private columns: Pointer<TableColumn<Data>[]> = asPointer([]);
    private hoveredRow: Pointer<number | undefined> = asPointer(undefined);
    private rowClick: Pointer<RowClickHandler | undefined> = asPointer(undefined);
    constructor(dataSource: Pointer<Data[]>) {
        super();
        this.wrapper.append(this.columns.map(columns => Box(
            ...columns.map((column, columnIndex) => Box(
                this.header(column),
                dataSource.map(rows =>
                    Box(
                        ...rows.map((row, rowIndex) => {
                            const hovering = refMerge({
                                clickEnabled: this.rowClick.map(it => !!it),
                                hoveredRow: this.hoveredRow
                            });
                            const item = Box(column.converter(row))
                                .addClass(rowIndex % 2 == 0 ? "even" : "odd", "item", columnIndex == 0 ? "left" : (columnIndex == columns.length - 1 ? "right" : "middle"))
                                .addClass(hovering.map(({ clickEnabled, hoveredRow }) => clickEnabled && hoveredRow === rowIndex ? "hover" : "non-hover"))
                                .draw();
                            item.addEventListener("pointerenter", () => this.hoveredRow.setValue(rowIndex));
                            item.addEventListener("pointerleave", () => this.hoveredRow.setValue(undefined));
                            item.onclick = () => {
                                this.rowClick.getValue()?.(rowIndex, columnIndex);
                            };
                            return Custom(item);
                        })
                    )
                        .removeFromLayout()
                )
                    .asRefComponent()
                    .removeFromLayout()
            ).addClass("column"))
        ).addClass("wgtable")).asRefComponent().draw());
    }

    setColumnTemplate(layout: Pointable<string>) {
        asPointer(layout).listen(value => {
            this.wrapper.style.setProperty("--wgtable-column-template", value);
        });
        return this;
    }

    addColumn(title: Pointer<string> | string, converter: TableColumn<Data>[ "converter" ], sorting?: Pointer<undefined | TableSorting> | undefined | TableSorting, size: TableColumn<Data>[ "size" ] = 'auto') {
        this.columns.setValue([ ...this.columns.getValue(), <TableColumn<Data>>{
            converter,
            size,
            title: asPointer(title ?? ""),
            sorting: asPointer(sorting)
        } ]);
        return this;
    }

    setRowClick(clickHandler: Pointable<RowClickHandler>) {
        asPointer(clickHandler).listen(value => this.rowClick.setValue(value));
        return this;
    }

    private header(column: TableColumn<Data>) {
        return Box(
            Label(column.title)
        ).addClass("header");
    }
}

function refMerge<PointerRecord extends Record<string, Pointer<unknown>>>(data: PointerRecord): Pointer<{ [ P in keyof PointerRecord ]: ReturnType<PointerRecord[ P ][ "getValue" ]> }> {
    const loadData = () => Object.fromEntries(Object.entries(data).map(([ key, value ]) => [ key, value.getValue() ])) as { [ P in keyof PointerRecord ]: ReturnType<PointerRecord[ P ][ "getValue" ]> };

    const internalValue = asPointer(loadData());
    for (const iterator of Object.values(data)) {
        let firstTime = true;
        iterator.listen(() => {
            if (firstTime)
                return firstTime = false;
            internalValue.setValue(loadData());
        });
    }
    return internalValue;
}

const allFiles = refMerge({
    uploadingFiles: uploadingFiles
        .map(files => Object.entries(files)
            .filter(([ path ]) => dirname(path) === currentPath.getValue())
            .map(([ name, uploadingRatio ]) => (<RemotePath>{ name, uploadingRatio }))
        ),
    currentFiles: currentFiles.map(it => {
        const compare = new Intl.Collator().compare;
        return Array.from(it).sort((a, b) => compare(a.name, b.name)).sort((a, b) => Number(!!a.fileMimeType) - Number(!!b.fileMimeType));

    })
}).map(({ currentFiles, uploadingFiles }) => [ ...uploadingFiles, ...currentFiles ]);

const path = asPointer("");
const loading = asPointer(false);
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
                                id: "files",
                                title: "Files",
                                subtitle: "Upload and manage your files.",
                                clickHandler: async () => {
                                    await listFiles("/");
                                    path.setValue("/");
                                },
                                children: [
                                    DropHandler(
                                        async (files, count) => {
                                            console.log("Uploading", count, "files");
                                            for await (const _iterator of files) {
                                                await new Promise<void>((done) => {
                                                    uploadFile(_iterator.path, _iterator.file, (ratio) => {
                                                        console.log(_iterator.path, ratio);
                                                        uploadingFiles.setValue({
                                                            ...uploadingFiles.getValue(),
                                                            [ "/" + _iterator.path ]: ratio
                                                        });
                                                        if (ratio >= 1) {
                                                            done();
                                                        }
                                                    });
                                                });
                                                uploadingFiles.setValue(Object.fromEntries(Object.entries(uploadingFiles.getValue()).filter(([ path ]) => path != _iterator.path)));
                                            }
                                        },
                                        Grid(
                                            BasicLabel({
                                                title: "File Browser",
                                                subtitle: "Drag and Drop files/folders here to upload and download them faster."
                                            }),
                                            path.map(list => Grid(
                                                ...list.split("/").filter((_, index, list) => (list.length - 1) != index).map((item, currentIndex, list) => Button(item || 'home')
                                                    .setStyle(ButtonStyle.Secondary)
                                                    .onClick(() => {
                                                        path.setValue([ ...list.filter((_, listIndex) => listIndex <= currentIndex), '' ].join("/"));
                                                        loading.setValue(true);
                                                        listFiles(path.getValue()).finally(() => loading.setValue(false));
                                                    })),
                                                Box(Custom(loadingWheel() as Element as HTMLElement)).addClass(loading.map(it => it ? "loading" : "non-loading"), "loading-box"),
                                            ).setJustify("start").addClass("path-bar")).asRefComponent().removeFromLayout(),
                                            Entry(
                                                new Table2(allFiles)
                                                    .addColumn("Name", (data) => Box(BIcon("globe2"), BasicLabel({ title: data.name }).addClass("small-text")).addClass("file-item"))
                                                    .addColumn("Last Modified", (data) => data.lastModified !== undefined ? Label(new Date(data.lastModified).toLocaleString()) : Box())
                                                    .addColumn("Type", (data) => data.fileMimeType !== undefined ? Label(data.fileMimeType) : Box())
                                                    .addColumn("Size", (data) => data.size !== undefined ? Label(format(parseInt(data.size))).addClass('text-align-right') : Box())
                                                    .setRowClick((rowIndx) => {
                                                        const data = allFiles.getValue()[ rowIndx ];
                                                        console.log(data);
                                                        if (data.fileMimeType === undefined) {
                                                            path.setValue(path.getValue() + data.name + "/");
                                                            loading.setValue(true);
                                                            listFiles(path.getValue()).finally(() => loading.setValue(false));
                                                        } else {
                                                            Dialog(() => Label(JSON.stringify(data))).setTitle("File Info").allowUserClose().open();
                                                        }
                                                    })
                                            ).addClass("file-browser")
                                        ),
                                    ).addClass("drop-area")

                                ]
                            },
                            {
                                id: "database",
                                title: "Database",
                                subtitle: "Create a MariaDB Database",
                                suffix: Label("Coming Soon")
                                    .setFont(1, 500)
                                    .setMargin("0 1rem")
                            }
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
                                id: "extenions",
                                title: "Download Content",
                                subtitle: "Get access to Mods, Plugins or Datapacks!",
                                suffix: Label("Coming Soon")
                                    .setFont(1, 500)
                                    .setMargin("0 1rem")
                            },
                            // {
                            //     id: "worlds",
                            //     title: "Manage Worlds",
                            //     subtitle: "Download, Reset or Upload your worlds.",
                            //     suffix: Label("Coming Soon")
                            //         .setFont(1, 500)
                            //         .setMargin("0 1rem")
                            // },
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
    if ([ "servers/", "resources/", "legacy-servers/" ].includes(path))
        hostingButtons.setValue(
            [
                Button("Start new Server")
                    .setColor(state.$meta.map(() => !state.meta || (state.meta.used.slots >= state.meta.limits.slots) ? Color.Disabled : Color.Grayscaled))
                    .onClick(() => {
                        location.href = "/hosting/create";
                    })
            ]
        );
    else
        hostingButtons.setValue([]);
});
type GridItem = Component | [ settings: {
    width?: number | undefined;
    heigth?: number | undefined;
}, element: Component ];

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
            .onClick(async (e) => {
                e.stopPropagation();
                await API.hosting.serverId(server._id).power("start");
                // This actually works when we a have better change stream system
                server.state = "starting";
            }),
        // TODO: make this better (labels or something)
        "installing": LoadingSpinner(),
        "stopping": LoadingSpinner(),
        "starting": LoadingSpinner(),
        "running": IconButton(MIcon("stop"), "delete")
            .setColor(Color.Critical)
            .onClick(async (e) => {
                e.stopPropagation();
                server.state = "stopping";
                await API.hosting.serverId(server._id).power("stop");
            })
    })[ state ] ?? Box()))
        .asRefComponent()
        .addClass(isMobile.map(it => it ? "small" : "normal"), "icon-buttons-list", "action-list");
}

const SECOND = 1000; // Milliseconds
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

function formatTime(duration: number): string {
    if (duration < 5 * SECOND) {
        return 'now';
    } else if (duration < MINUTE) {
        return `${Math.floor(duration / SECOND)}s`;
    } else if (duration < 20 * MINUTE) {
        const minutes = Math.floor(duration / MINUTE);
        const seconds = Math.floor((duration % MINUTE) / SECOND);
        return `${minutes}min ${seconds}s`;
    } else if (duration < HOUR) {
        return `${Math.floor(duration / MINUTE)}min`;
    } else if (duration < 72 * HOUR) {
        return `${Math.floor(duration / HOUR)}h`;
    } else {
        const days = Math.floor(duration / DAY);
        const hours = Math.floor((duration % DAY) / HOUR);
        return `${days}d ${hours}h`;
    }
}

function calculateUptime(startDate: Date): string {
    const duration = new Date().getTime() - startDate.getTime();
    return formatTime(duration);
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
        title: input.$disk.map(it => it ? `${((it / server.limits.disk) * 100).toFixed(0)} %` : "---"),
        subtitle: "disk",
    });

    terminal.connected.listen(val => {
        if (val) {
            currentDetailsTarget.setValue(server._id);

            currentDetailsSource.setValue((data: ServerDetails) => {
                if (data.type == "stdout") {
                    terminal.write(server.identifier ? `${data.chunk}\r\n` : data.chunk.replaceAll("\n", "\r\n"));
                    if (data.clearConsole)
                        terminal.reset();
                }
                else if (data.type == "stats") {
                    input.cpu = data.cpu;
                    input.disk = data.disk;
                    input.memory = data.memory;
                }
                else if (data.type == "features") {
                    // TODO remove this when backend sends clearConsole flag
                    terminal.reset();
                }
                else console.log("Unhandled Info", data);
            });
        } else
            currentDetailsTarget.setValue(undefined);
    });

    return HeavyReRender(isMobile, mobile => {
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
                                messageQueue.push({
                                    action: MessageType.Trigger,
                                    type: "@bbn/hosting/stdin",
                                    data: {
                                        id: server._id,
                                        message: input.message
                                    },
                                    auth: {
                                        token: API.getToken(),
                                        id: activeUser.id
                                    }
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
                    }).onClick(() => {
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
    });
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
                    .setMax(state.meta.limits.memory - state.meta.used.memory + server.limits.memory)
                    .sync(data, "memory")
                    .setRender((val) => format(val * MB)),
                SliderInput("Disk (Storage)")
                    .setMax(state.meta.limits.disk - state.meta.used.disk + server.limits.disk)
                    .sync(data, "disk")
                    .setRender((val) => format(val * MB)),
                SliderInput("CPU (Processor)")
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
