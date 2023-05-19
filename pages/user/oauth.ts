import { Button, Grid, MediaQuery, PlainText, Vertical, View, WebGen, Image, Color, Icon, Horizontal, ButtonStyle, Spacer, img, Custom, State, Reactive } from "webgen/mod.ts";
import '../../assets/css/main.css';
import '../../assets/css/signin.css';
import { DynaNavigation } from "../../components/nav.ts";
import { API } from "../manager/RESTSpec.ts";
import { RegisterAuthRefresh, activeUser, logOut } from "../manager/helper.ts";
import './oauth.css';
import { dots, templateArtwork } from "../../assets/imports.ts";
import { ProfilePicture, getNameInital } from "../admin/helper.ts";
import { LoadingSpinner } from "../shared/components.ts";

await RegisterAuthRefresh();

const para = new URLSearchParams(location.search);
const params = {
    clientId: para.get("client_id"),
    scope: para.get("scope"),
    state: para.get("state"),
    redirectUri: para.get("redirect_uri"),
    //TODO: USE PROMPT
    prompt: para.get("prompt"),
};

WebGen();

const state = State({
    loaded: false,
    name: "",
    icon: ""
});

const list = Reactive(state, "loaded", () => {
    if (state.loaded)
        return Grid(
            MediaQuery("(max-width: 700px)", (small) =>
                PlainText("Connect Now!")
                    .setMargin("5rem 0 .8rem")
                    .addClass(small ? "no-custom" : "line-header", "header")
                    .setFont(small ? 4 : 5.375, 800)
            ).removeFromLayout(),
            PlainText("CONNECTION")
                .addClass("label-small"),
            Grid(
                Grid(
                    Image(state.icon || templateArtwork, "New Connection"),
                    PlainText(state.name || "---")
                        .addClass("label-small", "label-center")
                ),
                Image(dots, "dots"),
                Grid(
                    ProfilePicture(
                        activeUser.avatar ?
                            Custom(img(activeUser.avatar))
                            : PlainText(getNameInital(activeUser.username ?? "")),
                        activeUser.username ?? ""
                    ),
                    PlainText(activeUser.username ?? "")
                        .addClass("label-small", "label-center")
                )
            ).addClass("linkage"),
            PlainText("PERMISSIONS")
                .addClass("label-small"),
            Grid(
                Icon("check"),
                PlainText("Access to view your ID and Picture")
            )
                .addClass("permission"),
            Grid(
                Icon("check"),
                PlainText("Access to view your Email address")
            )
                .addClass("permission"),
            Button("Connect")
                .setWidth("100%")
                .setJustify("center")
                .setMargin("1rem 0 0")
                .onClick(() => {
                    //TODO: VALIDATE FIRST
                    const url = new URL(params.redirectUri ? params.redirectUri : "https://bbn.one");
                    url.searchParams.set("code", API.getToken());
                    url.searchParams.set("state", params.state!);
                    window.location.href = url.toString();
                }),
            Horizontal(
                PlainText("Wrong account?"),
                Button("Switch it here")
                    .setStyle(ButtonStyle.Inline)
                    .setColor(Color.Colored)
                    .onClick(() => {
                        logOut();
                    })
                    .addClass("link"),
                Spacer()
            )
                .setMargin("1rem 0 0"),
        )
            .addClass("limited-width")
            .addClass("area-space")
            .setJustify("start" as "flex-start");
    return LoadingSpinner();
});

View(() => Vertical(
    ...DynaNavigation("Home"),
    list
))
    .appendOn(document.body);

API.oauth(API.getToken()).get(params.clientId!).then(async (e) => {
    state.name = e.name;
    state.icon = e.icon ? URL.createObjectURL(await API.oauth(API.getToken()).icon(params.clientId!)) : "";
    state.loaded = true;
});
