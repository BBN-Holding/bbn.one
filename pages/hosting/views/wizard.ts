import { API, displayError, LoadingSpinner, SliderInput } from "shared";
import { format } from "std/fmt/bytes.ts";
import { BasicLabel, Box, Dialog, DropDownInput, Grid, Label, Page, TextInput, Vertical, Wizard } from "webgen/mod.ts";
import locations from "../../../data/locations.json" assert { type: "json" };
import { ServerCreate, serverCreate } from "../../../spec/music.ts";
import { creationState, MB, state } from "../data.ts";

export const creationView = () => creationState.$loading.map(loading => {
    if (loading)
        return LoadingSpinner();

    return creationState.$type.map(() => Vertical(
        Label("Final Steps!")
            .addClass("same-height")
            .setFont(2, 700)
            .setMargin(".8rem 0 0"),
        Label("You are almost there!")
            .addClass("gray-color")
            .setFont(1, 700)
            .setMargin("0.4rem 0 0"),

        Vertical(
            Wizard({
                submitAction: async ([ { data: { data } } ]) => {
                    creationState.loading = true;
                    const rsp = await API.hosting.create(data);
                    if (rsp.status === "fulfilled") {
                        Dialog(() => Label("Server has been created. We are now installing everything for you."))
                            .setTitle("Successful!")
                            .allowUserClose()
                            .addButton("Return", "remove")
                            .onClose(() => location.href = "/hosting")
                            .open();
                    } else {
                        alert(displayError(rsp.status));
                        location.reload();
                    }
                },
                buttonAlignment: "bottom",
                buttonArrangement: "flex-end"
            }, () => [
                Page(<ServerCreate>{
                    name: "",
                    type: creationState.type,
                    location: "bbn-fsn",
                    limits: {
                        memory: state.meta.limits.memory - state.meta.used.memory,
                        disk: state.meta.limits.disk - state.meta.used.disk,
                        cpu: state.meta.limits.cpu - state.meta.used.cpu
                    }
                }, (data) => [
                    Box(
                        Label("About your Server")
                            .setFont(.8, 700),
                        Grid(
                            TextInput("text", "Friendly Name")
                                .sync(data, "name"),
                            DropDownInput("Location", Object.keys(locations))
                                .setRender((val) => locations[ val as keyof typeof locations ])
                                .sync(data, "location"),
                            /*DropDownInput("Version", Object.keys(locations))
                                .setRender((val) => locations[ val as keyof typeof locations ])
                                .sync(data, "location")*/
                        )
                            .setDynamicColumns(10)
                            .setMargin(".5rem 0 2rem")
                            .setGap("var(--gap)"),

                        Label("Setup Ressources")
                            .setFont(.8, 700),
                        Grid(
                            SliderInput("Memory (RAM)")
                                .setMax(state.meta.limits.memory - state.meta.used.memory)
                                .sync(data.limits, "memory")
                                .setRender((val) => format(val * MB)),
                            SliderInput("Storage (Disk)")
                                .setMax(state.meta.limits.disk - state.meta.used.disk)
                                .sync(data.limits, "disk")
                                .setRender((val) => format(val * MB)),
                            SliderInput("Processor (CPU)")
                                .setMax(state.meta.limits.cpu - state.meta.used.cpu)
                                .sync(data.limits, "cpu")
                                .setRender((val) => `${val.toString()} %`),
                        )
                            .setDynamicColumns(10)
                            .setMargin(".5rem 0 1.5rem")
                            .setGap("var(--gap)")
                    ).addClass("wizard-colors")
                ]).setValidator(() => serverCreate)
            ]),
            Grid(
                BasicLabel({ title: "", subtitle: "When pressing Submit you also accept the Minecraft EULA" }).addClass("small")
            ).setJustify("end")
        )
            .setGap("0.5rem")
            .setWidth("100%")
            .setMargin("1.8rem 0 0")
    )).asRefComponent();
}).asRefComponent();
