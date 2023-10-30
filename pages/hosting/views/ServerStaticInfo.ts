import { format } from "std/fmt/bytes.ts";
import { asPointer, BasicLabel, Component, Entry, Grid, ref, refMerge, StateHandler } from "webgen/mod.ts";
import { Server } from "../../../spec/music.ts";
import { MB } from "../data.ts";
import { ChangeStateButton } from "./changeStateButton.ts";
import { GridItem } from "./types.ts";
import { calculateUptime } from "./uptime.ts";

const time = asPointer(new Date().getTime());
setInterval(() => time.setValue(new Date().getTime()), 200);

export function ServerStaticInfo(mobile: boolean, server: StateHandler<Server>, input: StateHandler<{
    cpu: number | undefined;
    memory: number | undefined;
    disk: number | undefined;
    message: string;
}>) {
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


    return mobile ? <Component[]>[
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
    ];
}
