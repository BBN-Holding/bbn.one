import { API, Footer, LoadingSpinner, stupidErrorAlert } from "shared/mod.ts";
import { Box, Button, ButtonStyle, Color, Grid, Horizontal, Image, Label, MIcon, Spacer, State, Vertical, View, WebGen, isMobile } from "webgen/mod.ts";
import '../../assets/css/main.css';
import { dots, templateArtwork } from "../../assets/imports.ts";
import { DynaNavigation } from "../../components/nav.ts";
import { OAuthScopes } from "../../spec/music.ts";
import { ProfilePicture, RegisterAuthRefresh, activeUser, getNameInital, logOut } from "../_legacy/helper.ts";
import './oauth.css';
import './signin.css';

await RegisterAuthRefresh();

const oauthScopes = {
    "profile": "See your profile information",
    "email": "See your email address",
    "phone": "See your phone number",
} satisfies Record<OAuthScopes, string>;

const para = new URLSearchParams(location.search);
const params = {
    clientId: para.get("client_id"),
    scope: para.get("scope"),
    state: para.get("state"),
    redirectUri: para.get("redirect_uri"),
    prompt: para.get("prompt"),
};

if (!params.clientId || !params.scope || !params.redirectUri) {
    alert("Invalid OAuth Request");
    throw new Error("Invalid OAuth Request");
}

WebGen();

const state = State({
    loaded: false,
    name: "",
    icon: ""
});

const list = state.$loaded.map(loaded => {
    if (loaded)
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
                                Image(activeUser.avatar, "Profile Picture") : Label(getNameInital(activeUser.username)),
                            activeUser.username
                        ),
                        Label(activeUser.username)
                            .addClass("label-small", "label-center")
                    )
                ).addClass("linkage"),
                Label("PERMISSIONS")
                    .addClass("label-small"),
                Vertical(
                    params.scope!.split(",").map((e) => Grid(
                        MIcon("check"),
                        Label(oauthScopes[ e as OAuthScopes ])
                    ).addClass("permission"))
                ),
                Button("Connect")
                    .setWidth("100%")
                    .setJustify("center")
                    .setMargin("1rem 0 0")
                    .onPromiseClick(async () => await authorize()),
                Horizontal(
                    Label("Wrong account?"),
                    Button("Switch it here")
                        .setStyle(ButtonStyle.Inline)
                        .setColor(Color.Colored)
                        .onClick(() => logOut(location.pathname + location.search))
                        .addClass("link"),
                    Spacer()
                )
                    .setMargin("1rem 0 0"),
            )
        );
    return LoadingSpinner();
}).asRefComponent();

View(() => Vertical(
    DynaNavigation("Home"),
    Box().addClass("background-image"),
    list.addClass("auth-area"),
    Footer()
))
    .appendOn(document.body);

async function authorize() {
    await API.oauth.authorize(params.clientId!, params.scope!, params.redirectUri!)
        .then(stupidErrorAlert);
    const url = new URL(params.redirectUri!);
    url.searchParams.set("code", API.getToken());
    url.searchParams.set("state", params.state!);
    window.location.href = url.toString();
}

API.oauth.validate(params.clientId, params.scope, params.redirectUri)
    .then(stupidErrorAlert)
    .then(async (e) => {
        if (params.prompt !== "consent" && e.authorized) {
            await authorize();
            return;
        }
        state.name = e.name;
        state.icon = e.icon ? URL.createObjectURL(await API.oauth.icon(params.clientId!).then(stupidErrorAlert)) : "";
        state.loaded = true;
    });
