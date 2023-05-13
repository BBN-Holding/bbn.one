import { Box, Color, ButtonStyle, Custom, DropDownInput, Grid, Horizontal, InputForm, MaterialIcons, Page, PlainText, Reactive, Spacer, State, TextInput, Vertical, View, WebGen, Wizard, createElement } from "webgen/mod.ts";
import { Redirect, RegisterAuthRefresh } from "../manager/helper.ts";
import { DynaNavigation } from "../../components/nav.ts";
import '../../assets/css/main.css';
import '../../assets/css/hosting.css';
import { Menu } from "../shared/Menu.ts";
import { state } from "./data.ts";
import { format } from "std/fmt/bytes.ts";
import { ServerCreate, serverCreate } from "../../spec/music.ts";
import { API } from "../manager/RESTSpec.ts";

WebGen({
    icon: new MaterialIcons()
});

Redirect();
await RegisterAuthRefresh();

const SliderInput = (label: string) => new class extends InputForm<number> {
    input = createElement("input");
    valueRender = (value: number) => ((value / Number(this.input.max || "100")) * 100).toFixed(0) + " %";

    constructor() {
        super();
        const val = State({ value: "" });
        this.input.type = "range";
        this.input.classList.add("wslider");
        this.wrapper.append(Vertical(
            Horizontal(
                PlainText(label).setFont(0.8, 700),
                Spacer(),
                Reactive(val, "value", () => PlainText(val.value).setFont(0.8, 700)).addClass("same-height")
            ).setPadding("0 0.2rem"),
            Custom(this.input)
        ).setMargin("0 -0.1rem").draw());

        this.addEventListener("update", (event) => {
            const value = (<CustomEvent<number>>event).detail;
            if (value)
                this.wrapper.classList.add("has-value");
            this.input.value = (value ?? 0).toString();
        });
        this.input.oninput = () => {
            val.value = this.valueRender(this.input.valueAsNumber);
        };
        this.input.onchange = () => {
            val.value = this.valueRender(this.input.valueAsNumber);
            this.setValue(this.input.valueAsNumber);
        };
        this.addEventListener("data", () => {
            val.value = this.valueRender(this.input.valueAsNumber);
        });

        this.dispatchEvent(new CustomEvent("data", {}));
    }

    setMax(val: number) {
        this.input.max = val.toString();
        return this;
    }

    setStep(val: number) {
        this.input.step = val.toString();
        return this;
    }

    setMin(val: number) {
        this.input.min = val.toString();
        return this;
    }

    setStyle(_style: ButtonStyle): this {
        throw new Error("Method not implemented.");
    }
    setColor(_color: Color): this {
        throw new Error("Method not implemented.");
    }

};


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
                    try {
                        await API.hosting(API.getToken()).create(data);
                    } catch (error) {
                        alert(JSON.stringify(error));
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
                            DropDownInput("Location", [
                                "cluster1"
                            ]).setRender(() => "🇩🇪 Falkenstein (Free)")
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
                                .setRender((val) => format(val * 1000)),
                            SliderInput("Storage (Disk)")
                                .setMax(state.meta.limits.disk)
                                .sync(data.limits, "disk")
                                .setRender((val) => format(val * 1000)),
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


const Creator = creation.asComponent();

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
                    subtitle: "Start a Fabric/Quilt or Forge Server.",
                    items: [
                        {
                            title: "Fabric/Quilt",
                            id: "fabric+quilt/",
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