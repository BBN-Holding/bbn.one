import { API, stupidErrorAlert } from "shared/restSpec.ts";
import { SliderInput } from "shared/slider.ts";
import { format } from "std/fmt/bytes.ts";
import { Button, ButtonStyle, Color, DropDownInput, Grid, Label, MediaQuery, SheetDialog, TextInput, asState } from "webgen/mod.ts";
import locations from "../../../../data/locations.json" with { type: "json" };
import serverTypes from "../../../../data/servers.json" with { type: "json" };
import { Server } from "../../../../spec/music.ts";
import { sheetStack } from "../../../_legacy/helper.ts";
import { MB, state } from "../../data.ts";

export const editServerDialog = (server: Server, versions: string[]) => {
    const data = asState({
        name: server.name,
        memory: server.limits.memory,
        disk: server.limits.disk,
        cpu: server.limits.cpu,
        location: server.location,
        version: server.version
    });

    const sheet = SheetDialog(sheetStack, `Edit '${server.name}'`,
        Grid(
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
                    .setRender(location => locations[ location as keyof typeof locations ])
                    .sync(data, "location"),
                SliderInput("Memory (RAM)")
                    .setMin(1)
                    .setMax(state.meta.limits.memory - state.meta.used.memory + server.limits.memory)
                    .sync(data, "memory")
                    .setRender((val) => format(val * MB)),
                SliderInput("Disk (Storage)")
                    .setMin(server.limits.disk)
                    .setMax(state.meta.limits.disk - state.meta.used.disk + server.limits.disk)
                    .sync(data, "disk")
                    .setRender((val) => format(val * MB)),
                SliderInput("CPU (Processor)")
                    .setMin(1)
                    .setMax(state.meta.limits.cpu - state.meta.used.cpu + server.limits.cpu)
                    .sync(data, "cpu")
                    .setRender((val) => `${val.toString()} %`),
                DropDownInput("Version", versions)
                    .sync(data, "version")
            )
                .setGap()
                .setEvenColumns(small ? 1 : 3)
            ).removeFromLayout(),
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
                    })
            )
                .setGap(".5rem")
                .setJustifyItems("end")
                .setRawColumns("auto max-content")
        ).setGap()
    );
    return sheet;
};
