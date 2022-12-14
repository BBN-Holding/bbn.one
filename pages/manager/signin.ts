import { Button, ButtonStyle, Color, Custom, loadingWheel, Horizontal, img, Page, PlainText, Spacer, Vertical, View, WebGen, Box, Component, TextInput } from "webgen/mod.ts";
import '../../assets/css/main.css';
import '../../assets/css/signin.css';
import heroImage from '../../assets/img/hero-img.png';
import googleLog from '../../assets/img/googleLogo.svg';
import { DynaNavigation } from "../../components/nav.ts";
import { forceRefreshToken, Redirect } from "./helper.ts";
import { API } from "./RESTSpec.ts";
import { delay } from "https://deno.land/std@0.167.0/async/delay.ts";
WebGen({
});
const para = new URLSearchParams(location.search);
const { token, type, state, code } = {
    token: para.get("token"),
    type: para.get("type"),
    state: para.get("state"),
    code: para.get("code")
};

View<{ mode: "login" | "register" | "reset-password"; email?: string, name?: string; error?: string, resetToken?: string, loading: boolean, password: string; }>(({ state, update }) => Vertical(
    ...DynaNavigation("Home"),
    Horizontal(
        Vertical(
            PlainText("Welcome back!")
                .setMargin("5rem 0 .8rem")
                .addClass("line-header")
                .setWidth("21rem")
                .setFont(5.375, 800),
            (() => {
                if (state.loading) return Box(Custom(loadingWheel() as Element as HTMLElement), PlainText("Loading...")).addClass("loading", "loader");
                if (state.resetToken)
                    return Page({ password: "" }, (state) => [
                        TextInput("password", "New Passoword").sync(state, "password"),
                        Button("Reset your Password")
                            .setJustify("center")
                            .onPromiseClick(async () => {
                                try {
                                    await API.user(state.resetToken!).setMe.post({
                                        password: state.password
                                    });
                                    update({ resetToken: undefined, password: state.password });
                                } catch (_) {
                                    update({ error: "Failed: Please try again later" });
                                }
                            }),
                        PlainText(state.resetToken?.startsWith("!") ? "Error: Link is invalid" : "").addClass("error-message")
                    ]).disableAutoSpacerAtBottom().getComponents();
                return Page({
                    email: state.email,
                    name: state.name,
                    password: state.password
                }, (data) => [
                    Button("Sign in with Google")
                        .setMargin("0 0 .8rem")
                        .setJustify("center")
                        .asLinkButton(API.auth.fromUserInteractionLink())
                        .addPrefix(Custom(img(googleLog)).addClass("prefix-logo")),
                    Horizontal(state.error != undefined ? PlainText(`Error: ${state.error || "Something happend. Please try again later"}.`).addClass("error-message") : null, Spacer()),
                    ...(<{ [ key in NonNullable<typeof state.mode> ]: Component[]; }>{
                        login: [
                            TextInput("email", "Email").sync(data, "email"),
                            TextInput("password", "Passoword").sync(data, "password"),
                            Button("Login")
                                .onPromiseClick(async () => {
                                    const { email, password } = {
                                        email: data.email ?? "",
                                        password: data.password ?? "",
                                    };
                                    const rsp = await API.auth.email.post({
                                        email,
                                        password
                                    });
                                    if (API.isError(rsp))
                                        update({
                                            error: rsp.message || "",
                                            email: data.email
                                        });
                                    else
                                        logIn(rsp, "email").finally(Redirect);
                                })
                                .setJustify("center"),
                            Horizontal(
                                PlainText("New here?"),
                                Button("Create a Account")
                                    .setStyle(ButtonStyle.Inline)
                                    .onClick(() => update({ mode: "register", email: data.email, error: undefined }))
                                    .setColor(Color.Colored)
                                    .addClass("link"),
                                Spacer()
                            )
                                .setMargin("1rem 0 0"),
                            Horizontal(
                                PlainText("Forgot your Password?"),
                                Button("Reset it here")
                                    .setStyle(ButtonStyle.Inline)
                                    .setColor(Color.Colored)
                                    .onClick(() => update({ mode: state.mode == "login" ? "reset-password" : "login", email: data.email, error: undefined }))
                                    .addClass("link"),
                                Spacer()
                            )
                        ],
                        register: [
                            TextInput("text", "Name").sync(data, "name"),
                            TextInput("email", "Email").sync(data, "email"),
                            TextInput("password", "Passoword").sync(data, "password"),
                            Button("Register")
                                .onPromiseClick(async () => {
                                    const { name, email, password } = {
                                        email: data.email ?? "",
                                        password: data.password ?? "",
                                        name: data.name ?? ""
                                    };
                                    const rsp = await API.auth.register.post({
                                        name,
                                        email,
                                        password
                                    });
                                    if (API.isError(rsp))
                                        update({ error: rsp.message || "", name: data.name ?? "" });
                                    else
                                        logIn(rsp, "email").finally(Redirect);
                                })
                                .setJustify("center"),
                            Horizontal(
                                PlainText("Known here?"),
                                Button("Sign in")
                                    .setStyle(ButtonStyle.Inline)
                                    .onClick(() => update({ mode: "login", email: data.email, error: undefined }))
                                    .setColor(Color.Colored)
                                    .addClass("link"),
                                Spacer()
                            )
                                .setMargin("1rem 0 0"),
                        ],
                        "reset-password": [
                            TextInput("email", "Email").sync(data, "email"),
                            Button("Reset")
                                .onPromiseClick(async () => {
                                    try {
                                        if (data.email)
                                            await API.auth.forgotPassword.post({
                                                email: data.email ?? ""
                                            });
                                        else
                                            update({ error: "Email is missing", email: data.email });
                                    } catch (_) {
                                        update({ error: "Please try again later" });
                                    }
                                })
                                .setJustify("center"),
                            Horizontal(
                                PlainText("Known here?"),
                                Button("Sign in")
                                    .setStyle(ButtonStyle.Inline)
                                    .onClick(() => update({ mode: "login", error: undefined }))
                                    .setColor(Color.Colored)
                                    .addClass("link"),
                                Spacer()
                            )
                                .setMargin("1rem 0 0"),
                        ]
                    })[ state.mode ?? "login" ],
                ]).disableAutoSpacerAtBottom().getComponents();
            })()
        ).setGap("11px"),
        Spacer()
    ).addClass("limited-width"),
    Custom(img(heroImage)).addClass("background-image")
))
    .change(async ({ update }) => {
        update({ mode: "login" });
        if (type == "google" && state && code) {
            update({ loading: true });
            API.auth.google.post({ code, state })
                .then(x => logIn(x, "0auth"))
                .then(Redirect);
        }
        else if (type == "forgot-password" && token) {
            update({ loading: true });
            API.auth.fromUserInteraction.get("JWT " + token).then(async x => {
                await logIn(x, "email");
                update({ resetToken: API.getToken(), loading: false });
            }).catch(() => {
                update({ resetToken: "!", loading: false });
            });
        }
        else if (type == "sign-up" && token) {
            update({ loading: true });
            await API.user(API.getToken()).mail.validate.post(token);
            await forceRefreshToken();
            await delay(1000);
            Redirect();
        }
        else
            Redirect();
    })
    .appendOn(document.body);

async function logIn(data: { token: string; }, mode: "email" | "0auth") {
    localStorage.removeItem("type");
    const access = await API.auth.refreshAccessToken.post({ refreshToken: data.token });
    localStorage[ "access-token" ] = access.token;
    localStorage[ "refresh-token" ] = data!.token;
    localStorage[ "type" ] = mode;
}