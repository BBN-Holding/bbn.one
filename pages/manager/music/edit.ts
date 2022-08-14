import { Center, CenterV, Custom, loadingWheel, MaterialIcons, Spacer, Vertical, View, WebGen } from "webgen/mod.ts";
import { Redirect, RegisterAuthRefresh } from "../helper.ts";
import { changeThemeColor } from "../misc/common.ts";
import '../../../assets/css/main.css';
import '../../../assets/css/music.css';
import { DynaNavigation } from "../../../components/nav.ts";
import { API } from "../RESTSpec.ts";
import { EditViewState } from "./types.ts";
import { ChangeMain } from "./changeMain.ts";
import { ChangeDrop } from "./changeDrop.ts";
import { ChangeSongs } from "./changeSongs.ts";
WebGen({
    icon: new MaterialIcons(),
    events: {
        themeChanged: changeThemeColor()
    }
});
Redirect();
RegisterAuthRefresh();

const params = new URLSearchParams(location.search);
const data = Object.fromEntries(params.entries());
if (!data.id) {
    alert("ID is missing");
    location.href = "/music";
}

View<EditViewState>(({ state, update }) => Vertical(
    DynaNavigation("Music"),
    state.data ? [
        {
            "edit-drop": ChangeDrop(state.data, update),
            "edit-songs": ChangeSongs(state.data, update),
            main: ChangeMain(state.data, update)
        }[ state.route ?? "main" ]
    ] : [
        CenterV(
            Center(
                Custom(loadingWheel() as Element as HTMLElement)
            ).addClass("loading"),
            Spacer()
        ).addClass("wwizard")
    ]
))
    .appendOn(document.body)
    .change(({ update }) => {
        if (data.route)
            update({ route: data.route as EditViewState[ "route" ] });

        API.music(API.getToken())
            .id(data.id)
            .get()
            .then(async data => {
                if (data.artwork) {
                    const blob = await API.music(API.getToken()).id(params.get("id")!).artworkPreview();
                    update({ data: { ...data, [ "artwork-url" ]: URL.createObjectURL(blob) } });
                }
                else update({ data });
            });
    });