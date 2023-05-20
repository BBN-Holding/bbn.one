import { WebGen, MaterialIcons, Vertical, View } from "webgen/mod.ts";
import { RegisterAuthRefresh, permCheck, renewAccessTokenIfNeeded } from "../manager/helper.ts";
import { changeThemeColor } from "../manager/misc/common.ts";
import { DynaNavigation } from "../../components/nav.ts";

import '../../assets/css/main.css';
import '../../assets/css/admin.css';
import { adminMenu } from "./views/menu.ts";
import { refreshState } from "./loading.ts";
import { state } from "./state.ts";

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
    .then(() => refreshState())
    .then(() => state.loaded = true);