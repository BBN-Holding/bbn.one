import { format } from "@std/fmt/bytes";
import { API, stupidErrorAlert } from "shared/restSpec.ts";
import { SliderInput } from "shared/slider.ts";
import { asState, Button, ButtonStyle, Color, DropDownInput, Grid, isMobile, Label, SheetDialog, TextInput } from "webgen/mod.ts";
import locations from "../../../data/locations.json" with { type: "json" };
import serverTypes from "../../../data/servers.json" with { type: "json" };
import { Server } from "../../../spec/music.ts";
import { sheetStack } from "../../shared/helper.ts";
import { MB, state } from "../data.ts";

export const editServerDialog = (server: Server, versions: string[]) => {
    const data = asState({
        name: server.name,
        memory: server.limits.memory,
        disk: server.limits.disk,
        cpu: server.limits.cpu,
        location: server.location,
        version: server.version,
    });

    const sheet = SheetDialog(
        sheetStack,
        `Edit '${server.name}'`,
        Grid(
            Label(`A ${serverTypes[server.type].name} Server.`),
            isMobile.map((small) =>
                Grid(
                    [
                        {
                            width: small ? 1 : 2,
                        },
                        TextInput("text", "Friendly Name")
                            .ref(data.$name),
                    ],
                    DropDownInput("Location", Object.keys(locations))
                        .setRender((location) => locations[location as keyof typeof locations])
                        .ref(data.$location),
                    SliderInput("Memory (RAM)")
                        .setMin(1)
                        .setMax(state.meta.limits.memory - state.meta.used.memory + server.limits.memory)
                        .ref(data.$memory)
                        .setRender((val) => format(val * MB)),
                    SliderInput("Disk (Storage)")
                        .setMin(server.limits.disk)
                        .setMax(state.meta.limits.disk - state.meta.used.disk + server.limits.disk)
                        .ref(data.$disk)
                        .setRender((val) => format(val * MB)),
                    SliderInput("CPU (Processor)")
                        .setMin(1)
                        .setMax(state.meta.limits.cpu - state.meta.used.cpu + server.limits.cpu)
                        .ref(data.$cpu)
                        .setRender((val) => `${val.toString()} %`),
                    DropDownInput("Version", versions)
                        .ref(data.$version),
                )
                    .setGap()
                    .setEvenColumns(small ? 1 : 3)
            ).asRefComponent().removeFromLayout(),
            Grid(
                Button("Close")
                    .setStyle(ButtonStyle.Inline)
                    .onClick(() => sheet.close()),
                Button("Save")
                    .setColor(Color.Critical)
                    .onPromiseClick(async () => {
                        await API.hosting.serverId(server._id)
                            .edit(data)
                            .then(stupidErrorAlert);

                        location.reload();
                    }),
            )
                .setGap(".5rem")
                .setJustifyItems("end")
                .setRawColumns("auto max-content"),
        ).setGap(),
    );
    return sheet;
};
