import { format } from "https://deno.land/std@0.188.0/fmt/bytes.ts";
import { API, LoadingSpinner, SliderInput, stupidErrorAlert } from "shared";
import { Box, Color, CommonIconType, Component, Dialog, DropDownInput, Entry, Grid, Horizontal, IconButton, IconButtonComponent, MaterialIcons, MediaQuery, PlainText, Reactive, ref, State, StateHandler, TextInput, Vertical } from "webgen/mod.ts";
import servers from "../../../data/eggs.json" assert { type: "json" };
import locations from "../../../data/locations.json" assert { type: "json" };
import { Location, PowerState, Server } from "../../../spec/music.ts";
import { MB, state } from "../data.ts";
import './list.css';

new MaterialIcons();

type StateActions = {
    [ type in PowerState ]: Component | IconButtonComponent;
};

export const moveDialog = (name: string, from: Location, to: Location) => Dialog(() => Vertical(
    PlainText(`We are moving your Server '${name}' to a diffrent location.`)
        .setFont(1, 400),
    PlainText(`This could take some time. Moving form ${locations[ from ]} to ${locations[ to ]}.`)
        .setFont(1, 400),
))
    .setTitle("Moving your Server!")
    .addButton("Okay", "remove")
    .open();


export const entryServer = (server: StateHandler<Server>, small: boolean) => Entry({
    title: server.name,
    subtitle: ref`${server.$type.map(it => servers[ it ].name)} @ ${server.$state.map(it => it == "moving" ? "Moving to " : "")}${server.$location.map(it => locations[ it ])}`
})
    .addPrefix(Reactive(server, "state", () => Box().addClass("dot", server.state)).removeFromLayout())
    .addSuffix(
        Horizontal(
            IconButton("dashboard", "dashboard")
                .onClick(async () => {
                    const thing = await API.hosting(API.getToken()).serverId(server._id).get();
                    open(`https://panel.bbn.one/server/${thing.ptero.identifier}`, "_blank");
                }),
            IconButton(CommonIconType.Edit, "edit")
                .onClick(() => {
                    const data = State({
                        name: server.name,
                        memory: server.limits.memory,
                        disk: server.limits.disk,
                        cpu: server.limits.cpu,
                        location: server.location,
                    });
                    Dialog(() =>
                        Vertical(
                            PlainText(`A ${servers[ server.type ].name} Server.`),
                            MediaQuery("(max-width: 700px)", (small) => Grid(
                                [
                                    {
                                        width: small ? 1 : 2
                                    },
                                    TextInput("text", "Friendly Name")
                                        .sync(server, "name")
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
                            return "remove" as const;
                        })
                        .open();

                }),
            Reactive(server, "state", () => ((<StateActions>{
                "offline": IconButton("play_arrow", "delete")
                    .addClass("color-green")
                    .setColor(Color.Colored)
                    .onClick(async () => {
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
                    .onClick(async () => {
                        server.state = "stopping";
                        await API.hosting(API.getToken()).serverId(server._id).power("stop");
                    })
            })[ server.state ] ?? Box())).addClass("action-list").removeFromLayout()
        )
            .setGap(small ? ".5rem" : "1rem")
            .addClass("icon-buttons-list", small ? "small" : "normal")
    )
    .setPadding("1.6rem")
    .addClass(small ? "small" : "normal");

/**
 * @deprecated replace with HeavyList
 */
export const listView = (server: StateHandler<Server[]>) => MediaQuery("(max-width: 700px)", (small) => Reactive(state, "servers", () => Grid(
    ...server.map(server => entryServer(server, small)),
    ...[ ExplainerText(state.servers) ].filter(x => x) as Component[]
).setGap("var(--gap)").addClass("limited-width")));

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

export function ExplainerText(servers: Server[]) {
    return servers.length == 0 ?
        Vertical(
            PlainText("No Servers")
                .addClass("list-title")
                .setMargin("0"),
            PlainText("Welcome! Create a server to get going. 🤖🛠️"),
        ).setGap("1rem")
        : null;
}