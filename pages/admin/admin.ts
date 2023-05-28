import { MaterialIcons, Vertical, View, WebGen } from "webgen/mod.ts";
import { DynaNavigation } from "../../components/nav.ts";
import { permCheck, RegisterAuthRefresh, renewAccessTokenIfNeeded } from "../manager/helper.ts";
import { changeThemeColor } from "../manager/misc/common.ts";

import '../../assets/css/main.css';
import './admin.css';
import { refreshState } from "./loading.ts";
import { adminMenu } from "./views/menu.ts";

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

View(() => Vertical(...DynaNavigation("Admin"), adminMenu)).appendOn(document.body);

renewAccessTokenIfNeeded()
    .then(() => refreshState());