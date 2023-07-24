import { Vertical, View, WebGen } from "webgen/mod.ts";
import '../../assets/css/main.css';
import { DynaNavigation } from "../../components/nav.ts";
import { RegisterAuthRefresh, renewAccessTokenIfNeeded } from "../manager/helper.ts";
import { changeThemeColor } from "../manager/misc/common.ts";
import { state } from "./data.ts";
import { listener, refreshState } from "./loading.ts";
import { hostingMenu } from "./views/menu.ts";
import { migrationDialog } from "./views/profile.ts";

import '../../assets/css/hosting.css';
await RegisterAuthRefresh();

WebGen({
    events: {
        themeChanged: changeThemeColor()
    }
});

View(() => Vertical(...DynaNavigation("Hosting"), hostingMenu)).appendOn(document.body);

renewAccessTokenIfNeeded()
    .then(() => refreshState())
    .then(() => listener())
    .then(() => state.loaded = true)
    .then(() => new URLSearchParams(location.search).has("migrated") ? migrationDialog() : null);