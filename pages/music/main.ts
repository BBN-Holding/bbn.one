import { Vertical, View, WebGen } from "webgen/mod.ts";
import '../../assets/css/main.css';
import '../../assets/css/music.css';
import { DynaNavigation } from "../../components/nav.ts";
import { RegisterAuthRefresh, changeThemeColor, renewAccessTokenIfNeeded } from "../_legacy/helper.ts";
import { refreshState } from "./loading.ts";
import { musicMenu } from "./views/menu.ts";

await RegisterAuthRefresh();
WebGen({
    events: {
        themeChanged: changeThemeColor()
    }
});

View(() => Vertical(DynaNavigation("Music"), musicMenu))
    .appendOn(document.body);

renewAccessTokenIfNeeded()
    .then(() => refreshState());
