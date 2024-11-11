import { permCheck, RegisterAuthRefresh, renewAccessTokenIfNeeded } from "shared/helper.ts";
import { appendBody, Grid } from "webgen/mod.ts";
import "../../assets/css/main.css";
import { DynaNavigation } from "../../components/nav.ts";
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

appendBody(Grid(DynaNavigation("Admin"), adminMenu));

renewAccessTokenIfNeeded()
    .then(() => refreshState());
