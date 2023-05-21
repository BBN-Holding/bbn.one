import { MaterialIcons, Vertical, View, WebGen } from "webgen/mod.ts";
import { RegisterAuthRefresh, renewAccessTokenIfNeeded } from "../../manager/helper.ts";
import { DynaNavigation } from "../../../components/nav.ts";
import '../../../assets/css/main.css';
import '../../../assets/css/hosting.css';
import { Menu } from "../../shared/Menu.ts";
import { creationState, state } from "./../data.ts";
import { refreshState } from "../loading.ts";
import { creationView } from "./wizard.ts";
import { ServerTypes } from "../../../spec/music.ts";

await RegisterAuthRefresh();
WebGen({
    icon: new MaterialIcons()
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
                    subtitle: "Play on Efficiency-First Servers with Plugins (Paper/Purpur).",
                    action: (serverType) => { creationState.type = serverType as ServerTypes; },
                    custom: creationView
                },
                {
                    title: "Vanilla",
                    id: "vanilla/",
                    subtitle: "Playing on Snapshots? Play on the Vanilla Server.",
                    action: (clickPath) => { creationState.type = clickPath as ServerTypes; },
                    custom: creationView
                },
                {
                    title: "Modded",
                    id: "modded/",
                    subtitle: "Start a Fabric or Forge Server.",
                    items: [
                        {
                            title: "Fabric",
                            id: "fabric/",
                            subtitle: "The preferred server software for lightweight modding, customization, and optimized performance.",
                            action: (clickPath) => { creationState.type = clickPath as ServerTypes; },
                            custom: creationView
                        },
                        {
                            title: "Forge",
                            id: "forge/",
                            subtitle: "The go-to server software for Minecraft Java Edition, empowering extensive modding capabilities and customization options.",
                            action: (clickPath) => { creationState.type = clickPath as ServerTypes; },
                            custom: creationView
                        }
                    ]
                },
                {
                    title: "Bedrock",
                    id: "bedrock/",
                    subtitle: "Bedrock Edition (also known as the Bedrock Version, Bedrock Codebase, Bedrock Engine or just Bedrock)",
                    action: (clickPath) => { creationState.type = clickPath as ServerTypes; },
                    custom: creationView
                },
                {
                    title: "PocketMineMP",
                    id: "pocketmine/",
                    subtitle: "The ideal server software for Minecraft Bedrock Edition, providing customization, plugin support, and optimal performance.",
                    action: (clickPath) => { creationState.type = clickPath as ServerTypes; },
                    custom: creationView
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


View(() => Vertical(...DynaNavigation("Hosting"), menu)).appendOn(document.body);

renewAccessTokenIfNeeded()
    .then(() => refreshState())
    .then(() => state.loaded = true);
