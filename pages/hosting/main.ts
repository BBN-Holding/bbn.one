import { State, Vertical, View, WebGen } from "webgen/mod.ts";
import '../../assets/css/main.css';
import { DynaNavigation } from "../../components/nav.ts";
import { RegisterAuthRefresh, changeThemeColor, renewAccessTokenIfNeeded } from "../_legacy/helper.ts";
import { state } from "./data.ts";
import { listener, refreshState, startSidecarConnection, streamingPool } from "./loading.ts";
import { hostingMenu } from "./views/menu.ts";

import '../../assets/css/hosting.css';
import { LoadingSpinner } from "../shared/components.ts";
import { API, stupidErrorAlert } from "../shared/restSpec.ts";
await RegisterAuthRefresh();

const url = new URLSearchParams(location.search);

const urlPath = url.get("path");

WebGen({
    events: {
        themeChanged: changeThemeColor()
    }
});

View(() => Vertical(DynaNavigation("Hosting"), state.$loaded.map(loaded => loaded ? hostingMenu : LoadingSpinner()).asRefComponent())).appendOn(document.body);

renewAccessTokenIfNeeded()
    .then(async () => {
        if (!urlPath) {
            await refreshState();
            return;
        } else {
            state.meta = State(await API.hosting.meta());
            const serverId = urlPath.split("/")[ 1 ];
            if (serverId) {
                const server = await API.hosting.serverId(serverId).get().then(stupidErrorAlert);
                state.servers.push(State(server));
                await streamingPool();
                if (!server.identifier)
                    startSidecarConnection(serverId);
            } else {
                await refreshState();
            }
            console.log(urlPath);
            hostingMenu.path.setValue(urlPath);
            state.loaded = true;
        }
    })
    .then(() => listener());