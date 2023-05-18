import { Box, DropDownInput, Grid, MaterialIcons, Page, PlainText, Reactive, State, TextInput, Vertical, View, WebGen, Wizard, Dialog } from "webgen/mod.ts";
import { RegisterAuthRefresh } from "../../manager/helper.ts";
import { DynaNavigation } from "../../../components/nav.ts";
import '../../../assets/css/main.css';
import '../../../assets/css/hosting.css';
import { Menu } from "../../shared/Menu.ts";
import { MB, state } from "./../data.ts";
import { format } from "std/fmt/bytes.ts";
import { ServerCreate, serverCreate } from "../../../spec/music.ts";
import { API } from "../../manager/RESTSpec.ts";
import { LoadingSpinner } from "../../shared/components.ts";
import { SliderInput } from "../../shared/Slider.ts";
import locations from "../../../data/locations.json" assert { type: "json" };

await RegisterAuthRefresh();
WebGen({
    icon: new MaterialIcons()
});


const isLoading = State({
    loading: false
});

const creation = View<{ service: string; }>(({ state: { service } }) => {
    return Vertical(
        PlainText("Final Steps!")
            .addClass("same-height")
            .setFont(2, 700)
            .setMargin(".8rem 0 0"),
        PlainText("You are almost there!")
            .addClass("gray-color")
            .setFont(1, 700)
            .setMargin("0.4rem 0 0"),

        Vertical(
            Wizard({
                submitAction: async ([ { data: { data } } ]) => {
                    isLoading.loading = true;
                    try {
                        const rsp = await API.hosting(API.getToken()).create(data);

                        if (rsp.error)
                            throw rsp;

                        Dialog(() => PlainText("Server has been created. We are now installing everything for you."))
                            .setTitle("Successful!")
                            .allowUserClose()
                            .addButton("Return", "remove")
                            .onClose(() => location.href = "/hosting")
                            .open();
                    } catch (error) {
                        alert(JSON.stringify(error));
                        location.reload();
                    }
                },
                buttonAlignment: "bottom",
                buttonArrangement: "flex-end"
            }, () => [
                Page(<ServerCreate>{
                    name: "",
                    type: service,
                    location: "cluster1",
                    limits: state.meta.limits
                }, (data) => [
                    Box(
                        PlainText("About your Server")
                            .setFont(.8, 700),
                        Grid(
                            TextInput("text", "Friendly Name")
                                .sync(data, "name"),
                            DropDownInput("Location", Object.keys(locations))
                                .setRender((val) => locations[ val as keyof typeof locations ])
                                .sync(data, "location")
                        )
                            .setDynamicColumns(10)
                            .setMargin(".5rem 0 2rem")
                            .setGap("var(--gap)"),

                        PlainText("Setup Ressources")
                            .setFont(.8, 700),
                        Grid(
                            SliderInput("Memory (RAM)")
                                .setMax(state.meta.limits.memory)
                                .sync(data.limits, "memory")
                                .setRender((val) => format(val * MB)),
                            SliderInput("Storage (Disk)")
                                .setMax(state.meta.limits.disk)
                                .sync(data.limits, "disk")
                                .setRender((val) => format(val * MB)),
                        )
                            .setDynamicColumns(10)
                            .setMargin(".5rem 0 1.5rem")
                            .setGap("var(--gap)")
                    ).addClass("wizard-colors")
                ]).setValidator(() => serverCreate)
            ])
        )
            .setGap("0.5rem")
            .setWidth("100%")
            .setMargin("1.8rem 0 0")
    ).addClass("limited-width");
});


const Creator = Reactive(isLoading, "loading", () => {
    if (isLoading.loading)
        return LoadingSpinner();

    return creation.asComponent();
});

const menu = Menu({
    title: "New Server",
    id: "/",
    items: [
        {
            title: "Minecraft",
            id: "minecraft/",
            subtitle: "Quickly start a Vanilla, Modded or Bedrock Server",
            items: [
                {
                    title: "Recommended",
                    id: "default/",
                    subtitle: "Play on Efficent First Servers with Server-Side Modding (Plugins).",
                    action: (clickPath) => { creation.change(({ update }) => update({ service: clickPath })); },
                    custom: () => Creator
                },
                {
                    title: "Vanilla",
                    id: "vanilla/",
                    subtitle: "Playing on Snapshots? Play on the Vanilla Server.",
                    action: (clickPath) => { creation.change(({ update }) => update({ service: clickPath })); },
                    custom: () => Creator
                },
                {
                    title: "Modded",
                    id: "modded/",
                    subtitle: "Start a Fabric or Forge Server.",
                    items: [
                        {
                            title: "Fabric",
                            id: "fabric/",
                            action: (clickPath) => { creation.change(({ update }) => update({ service: clickPath })); },
                            custom: () => Creator
                        },
                        {
                            title: "Forge",
                            id: "forge/",
                            action: (clickPath) => { creation.change(({ update }) => update({ service: clickPath })); },
                            custom: () => Creator
                        }
                    ]
                },
                {
                    title: "Bedrock",
                    id: "bedrock/",
                    subtitle: "Play Modded or Vanilla.",
                    action: (clickPath) => { creation.change(({ update }) => update({ service: clickPath })); },
                    custom: () => Creator
                }
            ]
        },
        {
            title: "Cancel",
            subtitle: "Return back to Home",
            id: "exit/",
            action: () => { location.href = location.href.replace("/create", ""); }
        }
    ]
});

View(() => Vertical(
    ...DynaNavigation("Hosting"),
    menu
)).appendOn(document.body);