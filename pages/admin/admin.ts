import { Body, Vertical, WebGen } from "webgen/mod.ts";
import "../../assets/css/main.css";
import { DynaNavigation } from "../../components/nav.ts";
import { changeThemeColor, permCheck, RegisterAuthRefresh, renewAccessTokenIfNeeded, sheetStack } from "../shared/helper.ts";
import "./admin.css";
import { refreshState } from "./loading.ts";
import { adminMenu } from "./views/menu.ts";

await RegisterAuthRefresh();

if (
    !permCheck(
        "/hmsys/user/manage",
        "/bbn/manage",
    )
) {
    location.href = "/";
}

WebGen({
    events: {
        themeChanged: changeThemeColor(),
    },
});

sheetStack.setDefault(Vertical(DynaNavigation("Admin"), adminMenu));

Body(sheetStack);

renewAccessTokenIfNeeded()
    .then(() => refreshState());
