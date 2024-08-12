import { LoadingSpinner } from "shared/components.ts";
import { API, stupidErrorAlert } from "shared/restSpec.ts";
import { asState, Body, Vertical, WebGen } from "webgen/mod.ts";
import "../../assets/css/main.css";
import { DynaNavigation } from "../../components/nav.ts";
import { changeThemeColor, RegisterAuthRefresh, renewAccessTokenIfNeeded, sheetStack } from "../shared/helper.ts";
import { state } from "./data.ts";
import { listFiles, liveUpdates, refreshState, startSidecarConnection } from "./loading.ts";
import { hostingMenu } from "./views/menu.ts";
import { path } from "./views/state.ts";

import "../../assets/css/hosting.css";
await RegisterAuthRefresh();

const url = new URLSearchParams(location.search);

const urlPath = url.get("path");

WebGen({
    events: {
        themeChanged: changeThemeColor(),
    },
});

sheetStack.setDefault(Vertical(
    DynaNavigation("Hosting"),
    state.$loaded.map((loaded) => loaded ? hostingMenu : LoadingSpinner()).asRefComponent(),
));

Body(sheetStack);

renewAccessTokenIfNeeded()
    .then(() => refreshState())
    .then(async () => {
        if (!urlPath) {
            return;
        }
        const [source, serverId, subView] = urlPath.split("/");
        if (source === "servers" && serverId) {
            const server = await API.hosting.serverId(serverId).get().then(stupidErrorAlert);
            if (!state.servers.find((s) => s._id == serverId)) {
                state.servers.push(asState(server));
            }
            startSidecarConnection(serverId);
            if (subView === "storage") {
                await listFiles("/");
                path.setValue("/");
            }
        }
        hostingMenu.path.setValue(urlPath);
    })
    .then(() => liveUpdates())
    .then(() => state.loaded = true);
