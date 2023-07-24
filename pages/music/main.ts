import { Vertical, View, WebGen } from "webgen/mod.ts";
import '../../assets/css/main.css';
import '../../assets/css/music.css';
import { DynaNavigation } from "../../components/nav.ts";
import { RegisterAuthRefresh, renewAccessTokenIfNeeded } from "../_legacy/helper.ts";
import { changeThemeColor } from "../_legacy/misc/common.ts";
import { refreshState } from "./loading.ts";
import { state } from "./state.ts";
import { musicMenu } from "./views/menu.ts";

await RegisterAuthRefresh();
WebGen({
    events: {
        themeChanged: changeThemeColor()
    }
});

View(() => Vertical(...DynaNavigation("Music"), musicMenu))
    .appendOn(document.body);

// make sure we are safe then we start loading.
renewAccessTokenIfNeeded()
    .then(() => refreshState())
    .then(() => state.loaded = true);
