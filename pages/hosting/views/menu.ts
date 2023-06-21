import { MessageType } from "https://deno.land/x/hmsys_connector@0.9.0/spec/ws.ts";
import { API, count, HeavyReRender, LoadingSpinner, Navigation, RenderItem, SliderInput, stupidErrorAlert } from "shared";
import { format } from "std/fmt/bytes.ts";
import { asPointer, BasicLabel, Box, Button, Color, Component, Custom, Dialog, DropDownInput, Entry, Form, Grid, IconButton, IconButtonComponent, isMobile, MaterialIcons, MediaQuery, PlainText, Reactive, ref, State, StateHandler, TextInput, Vertical } from "webgen/mod.ts";
import serverTypes from "../../../data/eggs.json" assert { type: "json" };
import locations from "../../../data/locations.json" assert { type: "json" };
import { PowerState, Server, ServerDetails } from "../../../spec/music.ts";
import { activeUser } from "../../manager/helper.ts";
import { MB, state } from "../data.ts";
import { currentDetailsSource, currentDetailsTarget, messageQueue, streamingPool } from "../loading.ts";
import { profileView } from "../views/profile.ts";
import './details.css';
import './list.css';
import { moveDialog } from "./list.ts";
import { TerminalComponent } from "./terminal.ts";

new MaterialIcons();

type StateActions = {
    [ type in PowerState ]: Component | IconButtonComponent;
};

export const hostingButtons = asPointer(<Component[]>[]);

export const hostingMenu = Navigation({
    title: ref`Hi ${activeUser.$username} 👋`,
    actions: hostingButtons,
    categories: [
        {
            id: "servers",
            title: ref`Servers ${count(state.$servers)}`,
            // children: [
            //     HeavyReRender(isMobile, small =>
            //         HeavyList(state.$servers, item =>
            //             entryServer(item, small)
            //         )
            //     )
            // ],
            children: state.$servers.map(servers => servers.map(server =>
            (<RenderItem>{
                id: server._id,
                title: server.$name,
                replacement: Grid(
                    Box().addClass(server.$state, "dot"),
                    BasicLabel({
                        title: server.$name,
                        subtitle: ref`${server.$type.map(it => serverTypes[ it ].name)} @ ${server.$state.map(it => it == "moving" ? "Moving to " : "")}${server.$location.map(it => locations[ it ] ?? "(no location)")}`
                    })
                )
                    .setRawColumns("max-content auto")
                    .setGap("1rem")
                    .setAlign("center"),
                suffix: ChangeStateButton(server),
                clickHandler: async () => {
                    await streamingPool();
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
                                suffix: PlainText("Coming Soon")
                                    .setFont(1, 500)
                                    .setMargin("0 1rem")
                            },
                            {
                                id: "database",
                                title: "Database",
                                subtitle: "Enabled a MariaDB Database",
                                suffix: PlainText("Coming Soon")
                                    .setFont(1, 500)
                                    .setMargin("0 1rem")
                            }
                        ]
                    },
                    {
                        id: "settings",
                        hidden: true,
                        title: "Settings",
                        children: [
                            {
                                id: "ptero",
                                title: "Ptero Settings",
                                subtitle: "Legacy Settings Options",
                                clickHandler: () => editServer(server)
                            },
                            {
                                id: "extenions",
                                title: "Download Content",
                                subtitle: "Get access to Mods, Plugins or Databacks!",
                                suffix: PlainText("Coming Soon")
                                    .setFont(1, 500)
                                    .setMargin("0 1rem")
                            },
                            {
                                id: "worlds",
                                title: "Manage Worlds",
                                subtitle: "Download, Reset or Upload your worlds.",
                                suffix: PlainText("Coming Soon")
                                    .setFont(1, 500)
                                    .setMargin("0 1rem")
                            },
                            {
                                id: "core",
                                title: "Server Settings",
                                subtitle: "All your Settings in one place.",
                                suffix: PlainText("Coming Soon")
                                    .setFont(1, 500)
                                    .setMargin("0 1rem")
                            }
                        ]
                    }
                ]
            })
            ))
        },
        {
            id: "profile",
            title: "Profile",
            children: [
                Reactive(state, "meta", () =>
                    state.meta ? profileView() : LoadingSpinner()
                )
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
        hostingMenu.path.setValue((state.servers.length == 0 ? 'profile/' : 'servers/'));
    else
        hostingMenu.path.setValue("-/");
});
// .setActivePath(state.$loaded.map(loaded => loaded ? (state.servers.length == 0 ? '/profile/' : '/servers/') : '/'));

hostingMenu.path.listen(path => {
    if (path === "servers/" || path === "profile/")
        hostingButtons.setValue(
            [
                Button("Start new Server")
                    .onClick(() => {
                        location.href = "/hosting/create";
                    })
                    .setColor(state.$meta.map(() => !state.meta || (state.meta.used.slots >= state.meta.limits.slots) ? Color.Disabled : Color.Grayscaled))
            ]
        );
    else
        hostingButtons.setValue([]);
});

type GridItem = Component | [ settings: {
    width?: number | undefined;
    heigth?: number | undefined;
}, element: Component ];

function ChangeStateButton(server: StateHandler<Server>): Component {
    return Reactive(server, "state", () => ((<StateActions>{
        "offline": IconButton("play_arrow", "delete")
            .addClass("color-green")
            .setColor(Color.Colored)
            .onClick(async (e) => {
                e.stopPropagation();
                await API.hosting(API.getToken()).serverId(server._id).power("start");
                // This actually works when we a have better change stream system
                server.state = "starting";
            }),
        // TODO: make this better (labels or something)
        "installing": LoadingSpinner(),
        "stopping": LoadingSpinner(),
        "starting": LoadingSpinner(),
        "running": IconButton("stop", "delete")
            .setColor(Color.Critical)
            .onClick(async (e) => {
                e.stopPropagation();
                server.state = "stopping";
                await API.hosting(API.getToken()).serverId(server._id).power("stop");
            })
    })[ server.state ] ?? Box())).addClass(isMobile.map(it => it ? "small" : "normal"), "icon-buttons-list", "action-list");
}

function getTimeDifference(startDate: number) {
    const timeDiffMs = Math.abs(new Date().getTime() - new Date(startDate).getTime());

    const days = Math.floor(timeDiffMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeDiffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiffMs % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeDiffMs % (1000 * 60)) / (1000));

    let formattedTimeDiff = "";

    if (days > 0 && timeDiffMs >= 72 * 60 * 60 * 1000) {
        formattedTimeDiff += `${days}d `;
    }

    if (timeDiffMs > 1000 * 60 * 60 * 24)
        formattedTimeDiff += `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    else
        formattedTimeDiff += `${minutes.toString()}min ${seconds.toString()}s`;

    return formattedTimeDiff;
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
        title: server.$stateSince!.map(it => it ? getTimeDifference(it) : "---"),
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
        title: input.$disk.map(it => `${it ? (server.limits.disk / it).toFixed(0) + " %" : "---"}`),
        subtitle: "disk",
    });

    terminal.connected.listen(val => {
        if (val) {
            currentDetailsTarget.setValue(server._id);

            currentDetailsSource.setValue((data: ServerDetails) => {
                if (data.type == "stdout") {
                    terminal.write(data.chunk + "\r\n");
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
            Grid(
                Entry({
                    title: "Storage",
                    subtitle: "Manage your persistence",
                }).onClick(() => {
                    hostingMenu.path.setValue(hostingMenu.path.getValue() + "/storage");
                }),
                Entry({
                    title: "Settings",
                    subtitle: "Update your Server"
                }).onClick(() => {
                    hostingMenu.path.setValue(hostingMenu.path.getValue() + "/settings");
                }),
                Entry({
                    title: "Legacy",
                    subtitle: "Go to the legacy panel"
                }).onClick(async () => {
                    const thing = await API.hosting(API.getToken()).serverId(server._id).get();
                    open(`https://panel.bbn.one/server/${thing.ptero.identifier}`, "_blank");
                })
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
            PlainText(`A ${serverTypes[ server.type ].name} Server.`),
            MediaQuery("(max-width: 700px)", (small) => Grid(
                [
                    {
                        width: small ? 1 : 2
                    },
                    TextInput("text", "Friendly Name")
                        .sync(data, "name")
                ],
                DropDownInput("Location", Object.keys(locations))
                    .setColor(Color.Disabled)
                    .setRender(location => locations[ location as keyof typeof locations ])
                    .sync(data, "location"),
                SliderInput("Memory (RAM)")
                    .setMax(state.meta.limits.memory - state.meta.used.memory + server.limits.memory)
                    .sync(data, "memory")
                    .setRender((val) => format(val * MB)),
                SliderInput("Storage (Disk)")
                    .setMax(state.meta.limits.disk - state.meta.used.disk + server.limits.disk)
                    .sync(data, "disk")
                    .setRender((val) => format(val * MB)),
                SliderInput("Processor (CPU)")
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

            await API.hosting(API.getToken()).serverId(server._id)
                .edit(data)
                .then(stupidErrorAlert);

            location.reload();
            return "remove" as const;
        })
        .open();
}

function deleteServer(serverId: string) {
    Dialog(() => Box(PlainText("Deleting this Server, will result in data loss.\nAfter this point there is no going back.")).setMargin("0 0 1.5rem"))
        .setTitle("Are you sure?")
        .addButton("Cancel", "remove")
        .addButton("Delete", async () => {
            await API.hosting(API.getToken()).serverId(serverId).delete()
                .then(stupidErrorAlert)
                .catch(() => { });
            location.reload();
            return "remove" as const;
        }, Color.Critical)
        .allowUserClose()
        .open();
}
