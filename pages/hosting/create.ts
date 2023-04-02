import { MaterialIcons, PlainText, Vertical, View, WebGen } from "webgen/mod.ts";
import { Redirect, RegisterAuthRefresh } from "../manager/helper.ts";
import { DynaNavigation } from "../../components/nav.ts";
import '../../assets/css/main.css';
import { delay } from "https://deno.land/std@0.182.0/async/delay.ts";
import { Menu } from "../shared/Menu.ts";

WebGen({
    icon: new MaterialIcons()
});
Redirect();
await RegisterAuthRefresh();

const menu = Menu({
    title: "New Server",
    id: "/",
    items: [
        {
            title: "Minecraft",
            id: "minecraft/",
            subtitle: "Quickly start Vanilla, Modded and Bedrock Servers",
            items: [
                {
                    title: "Recommended",
                    id: "default/",
                    subtitle: "Play on Efficent First Servers with Server-Side Modding (Plugins)."
                },
                {
                    title: "Vanilla",
                    id: "vanilla/",
                    subtitle: "Playing on Snapshots? Play on the Vanilla Server.",
                    action: async () => {
                        await delay(1000);
                    },
                    custom: (path) => PlainText("Welcome to Wonderland! Here is your path " + path).addClass("limited-width")
                },
                {
                    title: "Modded",
                    id: "modded/",
                    subtitle: "Start a Fabric/Quilt or Forge Server.",
                    items: [
                        {
                            title: "Fabric/Quilt",
                            id: "fabric+quilt/",
                        },
                        {
                            title: "Forge",
                            id: "forge/",
                            custom: () => PlainText("Hello World")
                                .addClass("limited-width")
                        }
                    ]
                },
                {
                    title: "Bedrock",
                    id: "bedrock/",
                    subtitle: "Play Modded or Vanilla."
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