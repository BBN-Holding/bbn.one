import { Vertical, View, WebGen } from "webgen/mod.ts";
import '../../assets/css/main.css';
import { DynaNavigation } from "../../components/nav.ts";
import { RegisterAuthRefresh, changeThemeColor, renewAccessTokenIfNeeded } from "../_legacy/helper.ts";
import { refreshState } from "./loading.ts";

import { API, LoadingSpinner, stupidErrorAlert } from "shared";
import '../../assets/css/hosting.css';
import { detailsState } from "./data.ts";
import { ServerDetails } from "./views/ServerDetails.ts";
await RegisterAuthRefresh();

const params = new URLSearchParams(location.search);

if (!params.has("id")) {
    alert("ID is missing");
    location.href = "/hosting";
}

WebGen({
    events: {
        themeChanged: changeThemeColor()
    }
});

View(() => Vertical(
    DynaNavigation("Hosting"),
    detailsState.$server.map(server => server ? ServerDetails() : LoadingSpinner()).asRefComponent()
)).appendOn(document.body);

renewAccessTokenIfNeeded()
    .then(() => refreshState())
    .then(async () => detailsState.server = await API.hosting.serverId(params.get("id")!).get().then(stupidErrorAlert));
// .then(() => listener())
// .then(() => state.loaded = true);