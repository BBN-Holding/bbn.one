import { Navigation } from "shared";
import { MaterialIcons, Vertical, View, WebGen } from "webgen/mod.ts";
import '../../../assets/css/hosting.css';
import '../../../assets/css/main.css';
import { DynaNavigation } from "../../../components/nav.ts";
import { ServerTypes } from "../../../spec/music.ts";
import { RegisterAuthRefresh, renewAccessTokenIfNeeded } from "../../manager/helper.ts";
import { refreshState } from "../loading.ts";
import { creationState, state } from "./../data.ts";
import { creationView } from "./wizard.ts";

await RegisterAuthRefresh();
WebGen({
    icon: new MaterialIcons()
});

const navigation = Navigation({
    title: "New Server",
    categories: [
        {
            title: "Minecraft",
            id: "minecraft",
            subtitle: "Quickly start a Vanilla, Modded or Bedrock Server",
            children: [
                {
                    title: "Recommended",
                    id: "default/",
                    subtitle: "Play on Efficiency-First Servers with Plugins (Paper/Purpur).",
                    clickHandler: (serverType) => { creationState.type = serverType as ServerTypes; },
                    children: [
                        creationView()
                    ]
                },
                {
                    title: "Vanilla",
                    id: "vanilla/",
                    subtitle: "Playing on Snapshots? Play on the Vanilla Server.",
                    clickHandler: (clickPath) => { creationState.type = clickPath as ServerTypes; },
                    children: [
                        creationView()
                    ]
                },
                {
                    title: "Modded",
                    id: "modded/",
                    subtitle: "Start a Fabric or Forge Server.",
                    children: [
                        {
                            title: "Fabric",
                            id: "fabric/",
                            subtitle: "Lightweight modding, customization, and optimized performance.",
                            clickHandler: (clickPath) => { creationState.type = clickPath as ServerTypes; },
                            children: [
                                creationView()
                            ]
                        },
                        {
                            title: "Forge",
                            id: "forge/",
                            subtitle: "Extensive modding capabilities and customization options.",
                            clickHandler: (clickPath) => { creationState.type = clickPath as ServerTypes; },
                            children: [
                                creationView()
                            ]
                        }
                    ]
                },
                {
                    title: "Bedrock",
                    id: "bedrock/",
                    subtitle: "Bedrock Edition (also known as the Bedrock Version or just Bedrock)",
                    clickHandler: (clickPath) => { creationState.type = clickPath as ServerTypes; },
                    children: [
                        creationView()
                    ]
                },
                {
                    title: "PocketMineMP",
                    id: "pocketmine/",
                    subtitle: "Bedrock server, providing customization and plugin support.",
                    clickHandler: (clickPath) => { creationState.type = clickPath as ServerTypes; },
                    children: [
                        creationView()
                    ]
                }
            ]
        },
        {
            title: "Cancel",
            subtitle: "Return back to Home",
            id: "exit/",
            clickHandler: () => { location.href = location.href.replace("/create", ""); }
        }
    ]
});


View(() => Vertical(...DynaNavigation("Hosting"), navigation)).appendOn(document.body);

renewAccessTokenIfNeeded()
    .then(() => refreshState())
    .then(() => state.loaded = true);
