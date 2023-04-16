import { MaterialIcons, Vertical, View, WebGen } from "webgen/mod.ts";
import '../../assets/css/main.css';
import '../../assets/css/music.css';
import { Redirect, RegisterAuthRefresh, renewAccessTokenIfNeeded } from "../manager/helper.ts";
import { DynaNavigation } from "../../components/nav.ts";
import { musicMenu } from "./views/menu.ts";
import { refreshState } from "./loading.ts";
import { changeThemeColor } from "../manager/misc/common.ts";
import { state } from "./state.ts";

WebGen({
    icon: new MaterialIcons(),
    events: {
        themeChanged: changeThemeColor()
    }
});
Redirect();
await RegisterAuthRefresh();

View(() => Vertical(...DynaNavigation("Music"), musicMenu()))
    .appendOn(document.body);

// make sure we are safe then we start loading.
renewAccessTokenIfNeeded()
    .then(() => refreshState())
    .then(() => state.loaded = true);
