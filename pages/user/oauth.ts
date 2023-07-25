import { API, LoadingSpinner, stupidErrorAlert } from "shared";
import { Box, Button, ButtonStyle, Color, Custom, Grid, Horizontal, Image, Label, MIcon, Spacer, State, Vertical, View, WebGen, img, isMobile } from "webgen/mod.ts";
import '../../assets/css/main.css';
import { dots, templateArtwork } from "../../assets/imports.ts";
import { DynaNavigation } from "../../components/nav.ts";
import { ProfilePicture, RegisterAuthRefresh, activeUser, getNameInital, logOut } from "../_legacy/helper.ts";
import { Footer } from "../shared/footer.ts";
import './oauth.css';
import './signin.css';

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

const list = state.$loaded.map(() => {
    if (state.loaded)
        return Box(
            Grid(
                isMobile.map((small) =>
                    Label("Connect Now!")
                        .setMargin("5rem 0 .8rem")
                        .addClass(small ? "no-custom" : "line-header", "header")
                        .setFont(small ? 4 : 5.375, 800)
                ).asRefComponent().removeFromLayout(),
                Label("CONNECTION")
                    .addClass("label-small"),
                Grid(
                    Grid(
                        Image(state.icon || templateArtwork, "New Connection"),
                        Label(state.name || "---")
                            .addClass("label-small", "label-center")
                    ),
                    Image(dots, "dots"),
                    Grid(
                        ProfilePicture(
                            activeUser.avatar ?
                                Custom(img(activeUser.avatar))
                                : Label(getNameInital(activeUser.username ?? "")),
                            activeUser.username ?? ""
                        ),
                        Label(activeUser.username ?? "")
                            .addClass("label-small", "label-center")
                    )
                ).addClass("linkage"),
                Label("PERMISSIONS")
                    .addClass("label-small"),
                Grid(
                    MIcon("check"),
                    Label("Access to view your ID and Picture")
                )
                    .addClass("permission"),
                Grid(
                    MIcon("check"),
                    Label("Access to view your Email address")
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
                    Label("Wrong account?"),
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
        );
    return LoadingSpinner();
}).asRefComponent();

View(() => Vertical(
    ...DynaNavigation("Home"),
    Box().addClass("background-image"),
    list.addClass("auth-area"),
    Footer()
))
    .appendOn(document.body);

API.oauth(API.getToken()).get(params.clientId!)
    .then(stupidErrorAlert)
    .then(async (e) => {
        state.name = e.name;
        state.icon = e.icon ? URL.createObjectURL(await API.oauth(API.getToken()).icon(params.clientId!).then(stupidErrorAlert)) : "";
        state.loaded = true;
    });
