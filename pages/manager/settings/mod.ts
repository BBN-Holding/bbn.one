import { MaterialIcons, PlainText, Vertical, View, WebGen } from "webgen/mod.ts";
import { Redirect, RegisterAuthRefresh } from "../helper.ts";
import '../../../assets/css/main.css';
import { changeThemeColor } from "../misc/common.ts";
import { DynaNavigation } from "../../../components/nav.ts";
import { ActionBar } from "../misc/actionbar.ts";
WebGen({
    icon: new MaterialIcons(),
    events: {
        themeChanged: changeThemeColor()
    }
});
Redirect();
RegisterAuthRefresh();

View(() => Vertical(
    ...DynaNavigation("Settings"),
    ActionBar("Settings"),
    PlainText("More Settings will follow...")
        .addClass("limited-width")
))
    .appendOn(document.body);