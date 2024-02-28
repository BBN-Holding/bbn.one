import { API, LoadingSpinner, SliderInput, displayError } from "shared/mod.ts";
import { format } from "std/fmt/bytes.ts";
import { BasicLabel, Box, Button, CenterV, DropDownInput, Empty, Grid, Horizontal, Label, Spacer, TextInput, Validate, Vertical, asState, getErrorMessage, refMerge } from "webgen/mod.ts";
import { zod } from "webgen/zod.ts";
import locations from "../../../data/locations.json" with { type: "json" };
import { ServerCreate, serverCreate } from "../../../spec/music.ts";
import { MB, creationState, state } from "../data.ts";

const vState = asState({
    validationState: <zod.ZodError | undefined>undefined
});

export const creationView = () => creationState.$loading.map(loading => {
    if (loading)
        return LoadingSpinner();
    return refMerge({
        type: creationState.$type,
        versions: creationState.$versions
    }).map(({ versions }) => {
        const data = asState<ServerCreate>({
            name: "",
            type: creationState.type!,
            location: "bbn-hel",
            limits: {
                memory: state.meta.limits.memory - state.meta.used.memory,
                disk: state.meta.limits.disk - state.meta.used.disk,
                cpu: state.meta.limits.cpu - state.meta.used.cpu
            },
            version: versions[ 0 ] ?? "LATEST"
        });

        return Vertical(
            Label("Final Steps!")
                .addClass("same-height")
                .setTextSize("4xl")
                .setFontWeight("bold")
                .setMargin(".8rem 0 0"),
            Label("You are almost there!")
                .addClass("gray-color")
                .setFontWeight("bold")
                .setMargin("0.4rem 0 0"),

            Vertical(
                Box(
                    Label("About your Server")
                        .setTextSize("sm")
                        .setFontWeight("bold"),
                    Grid(
                        TextInput("text", "Friendly Name")
                            .sync(data, "name"),
                        DropDownInput("Location", Object.keys(locations).filter(x => x !== "bbn-sgp"))
                            .setRender((val) => locations[ val as keyof typeof locations ])
                            .sync(data, "location"),
                    )
                        .setDynamicColumns(10)
                        .setMargin(".5rem 0 2rem")
                        .setGap(),

                    Label("Setup Ressources")
                        .setTextSize("sm")
                        .setFontWeight("bold"),
                    Grid(
                        SliderInput("Memory (RAM)")
                            .setMax(state.meta.limits.memory - state.meta.used.memory)
                            .setMin(1)
                            .sync(data.limits, "memory")
                            .setRender((val) => format(val * MB)),
                        SliderInput("Storage (Disk)")
                            .setMax(state.meta.limits.disk - state.meta.used.disk)
                            .setMin(1)
                            .sync(data.limits, "disk")
                            .setRender((val) => format(val * MB)),
                        SliderInput("Processor (CPU)")
                            .setMax(state.meta.limits.cpu - state.meta.used.cpu)
                            .setMin(1)
                            .sync(data.limits, "cpu")
                            .setRender((val) => `${val.toString()} %`),
                        DropDownInput("Version", versions).sync(data, "version"),
                    )
                        .setDynamicColumns(10)
                        .setMargin(".5rem 0 1.5rem")
                        .setGap()
                ).addClass("wizard-colors"),
                Grid(
                    Horizontal(
                        //ngl this style="display: contents;" is kinda annoying
                        Box(vState.$validationState.map(error => error ? CenterV(
                            Label(getErrorMessage(error))
                                .addClass("error-message")
                                .setMargin("0 0.5rem 0 0")
                        )
                            : Empty()).asRefComponent()),
                        Spacer(),
                        Button("Submit").onClick(async () => {
                            const { error, validate } = Validate(
                                data,
                                serverCreate
                            );
                            const validation = validate();
                            if (error.getValue()) return vState.validationState = error.getValue();
                            creationState.loading = true;
                            const rsp = await API.hosting.create(validation!);
                            if (rsp.status === "fulfilled") {
                                location.href = "/hosting";
                            } else {
                                alert(displayError(rsp.status));
                                location.reload();
                            }
                        })
                    ).addClass("footer"),
                    BasicLabel({ title: "", subtitle: "When pressing Submit you also accept the Minecraft EULA" }).addClass("small")
                ).setJustifyItems("end"),

            )
                .setGap("0.5rem")
                .setWidth("100%")
                .setMargin("1.8rem 0 0")
        );
    }).asRefComponent();
}).asRefComponent();
