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
                    subtitle: "Play on Efficent First Servers with Server-Side Modding (Plugins).",
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
                            action: (clickPath) => { creationState.type = clickPath as ServerTypes; },
                            custom: creationView
                        },
                        {
                            title: "Forge",
                            id: "forge/",
                            action: (clickPath) => { creationState.type = clickPath as ServerTypes; },
                            custom: creationView
                        }
                    ]
                },
                {
                    title: "Bedrock",
                    id: "bedrock/",
                    subtitle: "Play Modded or Vanilla.",
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
