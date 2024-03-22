import { Body, Vertical, WebGen } from "webgen/mod.ts";
import "../../assets/css/main.css";
import "../../assets/css/music.css";
import { DynaNavigation } from "../../components/nav.ts";
import { changeThemeColor, RegisterAuthRefresh, renewAccessTokenIfNeeded } from "../_legacy/helper.ts";
import { refreshState } from "./loading.ts";
import { musicMenu } from "./views/menu.ts";

await RegisterAuthRefresh();
WebGen({
    events: {
        themeChanged: changeThemeColor(),
    },
});

Body(Vertical(DynaNavigation("Music"), musicMenu));

renewAccessTokenIfNeeded()
    .then(() => refreshState());
