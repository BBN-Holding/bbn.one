import { API } from "shared";
import { Center, CenterV, Custom, loadingWheel, Spacer, Vertical, View, WebGen } from "webgen/mod.ts";
import '../../../assets/css/main.css';
import '../../../assets/css/music.css';
import { DynaNavigation } from "../../../components/nav.ts";
import { RegisterAuthRefresh } from "../helper.ts";
import { changeThemeColor } from "../misc/common.ts";
import { ChangeDrop } from "./changeDrop.ts";
import { ChangeMain } from "./changeMain.ts";
import { ChangeSongs } from "./changeSongs.ts";
import { EditViewState } from "./types.ts";

WebGen({
    events: {
        themeChanged: changeThemeColor()
    }
});

await RegisterAuthRefresh();

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
                    const blob = await API.music(API.getToken()).id(params.get("id")!).artwork();
                    update({ data: { ...data, [ "artwork-url" ]: URL.createObjectURL(blob) } });
                }
                else update({ data });
            });
    });