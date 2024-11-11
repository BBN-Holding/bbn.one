import { LoadingSpinner } from "shared/components.ts";
import { RegisterAuthRefresh, renewAccessTokenIfNeeded } from "shared/helper.ts";
import { API, stupidErrorAlert } from "shared/restSpec.ts";
import { appendBody, asRefRecord, Grid } from "webgen/mod.ts";
import "../../assets/css/main.css";
import { DynaNavigation } from "../../components/nav.ts";
import { state } from "./data.ts";
import { listFiles, liveUpdates, refreshState, startSidecarConnection } from "./loading.ts";
import { hostingMenu } from "./views/menu.ts";
import { path } from "./views/state.ts";

import "../../assets/css/hosting.css";
await RegisterAuthRefresh();

const url = new URLSearchParams(location.search);

const urlPath = url.get("path");

appendBody(Grid(
    DynaNavigation("Hosting"),
    state.$loaded.map((loaded) => loaded ? hostingMenu : LoadingSpinner()).asRefComponent(),
));

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
                state.servers.push(asRefRecord(server));
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
