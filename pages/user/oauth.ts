import { Footer } from "shared/footer.ts";
import { activeUser, logOut, RegisterAuthRefresh } from "shared/helper.ts";
import { API, stupidErrorAlert } from "shared/mod.ts";
import { appendBody, asRefRecord, Content, Empty, FullWidthSection, Grid, isMobile, Label, MaterialIcon, PrimaryButton, Spinner, TextButton, WebGenTheme } from "webgen/mod.ts";
import "../../assets/css/main.css";
import { DynaNavigation } from "../../components/nav.ts";
import { OAuthScopes } from "../../spec/music.ts";
import "./oauth.css";
import "./signin.css";

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

const state = asRefRecord({
    loaded: false,
    name: "",
    icon: "",
});

appendBody(
    WebGenTheme(
        Content(
            FullWidthSection(DynaNavigation("Home"), Empty().addClass("background-image")),
            state.loaded.map((loaded) =>
                loaded
                    ? Grid(
                        isMobile.map((small) =>
                            Label("Connect Now!")
                                .setMargin("5rem 0 .8rem")
                                .addClass(small ? "no-custom" : "line-header", "header")
                                .setFontWeight("extrabold")
                                .setTextSize(small ? "6xl" : "7xl")
                        ),
                        // .removeFromLayout(),
                        Label("CONNECTION")
                            .addClass("label-small"),
                        Grid(
                            Grid(
                                // Image(state.icon || templateArtwork, "New Connection"),
                                Label(state.name || "---")
                                    .setJustifySelf("center")
                                    .addClass("label-small"),
                            ),
                            // Image(dots, "dots"),
                            Grid(
                                // ProfilePicture(
                                //     activeUser.avatar ? Image(activeUser.avatar, "Profile Picture") : Label(getNameInital(activeUser.username)),
                                //     activeUser.username,
                                // ),
                                Label(activeUser.username)
                                    .setJustifySelf("center")
                                    .addClass("label-small"),
                            ),
                        ).addClass("linkage"),
                        Label("PERMISSIONS")
                            .addClass("label-small"),
                        Grid(
                            params.scope!.split(",").map((e) =>
                                Grid(
                                    MaterialIcon("check"),
                                    Label(oauthScopes[e as OAuthScopes]),
                                ).addClass("permission")
                            ),
                        ),
                        PrimaryButton("Connect")
                            .onPromiseClick(async () => await authorize())
                            .setWidth("100%")
                            .setJustifyContent("center")
                            .setMargin("1rem 0 0"),
                        Grid(
                            Label("Wrong account?"),
                            TextButton("Switch it here")
                                // .setStyle(ButtonStyle.Inline)
                                // .setColor(Color.Colored)
                                .onClick(() => logOut(location.pathname + location.search))
                                .addClass("link"),
                        )
                            .setMargin("1rem 0 0"),
                    )
                    : Spinner()
            ).addClass("auth-area").setCssStyle("display", "grid"),
            FullWidthSection(Footer()),
        ),
    ),
);

async function authorize() {
    await API.oauth.authorize(params.clientId!, params.scope!, params.redirectUri!)
        .then(stupidErrorAlert);
    const url = new URL(params.redirectUri!);
    url.searchParams.set("code", API.getToken());
    url.searchParams.set("state", params.state!);
    globalThis.location.href = url.toString();
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
