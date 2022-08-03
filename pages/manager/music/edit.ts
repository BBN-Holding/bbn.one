import { Box, Center, CenterV, Custom, Grid, img, loadingWheel, MaterialIcons, PlainText, Spacer, Vertical, View, WebGen } from "webgen/mod.ts";
import { Redirect, RegisterAuthRefresh } from "../helper.ts";
import { changeThemeColor } from "../misc/common.ts";
import '../../../assets/css/main.css';
import { ActionBar } from "../misc/actionbar.ts";
import { Entry } from "../misc/Entry.ts";
import { DynaNavigation } from "../../../components/nav.ts";
import { API, Drop } from "../RESTSpec.ts";
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

View<{ data: Drop; }>(({ state }) => Vertical(
    DynaNavigation("Music"),
    state.data ? [
        Grid(
            Box(
                Custom(img(state.data[ "artwork-url" ])).addClass("upload-image"),
            )
                .addClass("image-edit", "small"),
        )
            .setEvenColumns(1, "10rem")
            .addClass("limited-width")
            .setMargin("3rem auto -3rem"),
        ActionBar(state.data.title ?? "(no title)"),
        Vertical(
            Entry("Drop", "Change Title, Release Date, ..."),
            Entry("Songs", "Move Songs, Remove Songs, Add Songs, ..."),
            Entry("Additional Data", "Change Release Date/Time, Store, Regions, ..."),
            Entry("Export", "Download your complete Drop with every Song"),
            Entry("Takedown", "Completely Takedown your Drop")
                .addClass("entry-alert"),
        )
            .setMargin("0 0 22px")
            .setGap("22px")

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