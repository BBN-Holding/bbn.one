import { MaterialIcons, Vertical, View, WebGen } from "webgen/mod.ts";
import { Redirect, RegisterAuthRefresh, permCheck, renewAccessTokenIfNeeded } from "../manager/helper.ts";
import { DynaNavigation } from "../../components/nav.ts";
import '../../assets/css/main.css';
import '../../assets/css/hosting.css';
import { changeThemeColor } from "../manager/misc/common.ts";
import { hostingMenu } from "./views/menu.ts";
import { state } from "./data.ts";
import { pulling, refreshState } from "./loading.ts";

Redirect();
await RegisterAuthRefresh();

if (!permCheck(
    "/hmsys/user/manage",
    "/bbn/manage"
)) {
    location.href = "/";
}


WebGen({
    icon: new MaterialIcons(),
    events: {
        themeChanged: changeThemeColor()
    }
});

View(() => Vertical(...DynaNavigation("Hosting"), hostingMenu())).appendOn(document.body);

renewAccessTokenIfNeeded()
    .then(() => refreshState())
    .then(() => pulling())
    .then(() => state.loaded = true);