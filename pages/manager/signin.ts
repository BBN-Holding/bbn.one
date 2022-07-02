import { Button, ButtonStyle, Color, Custom, loadingWheel, Horizontal, img, Input, Page, PlainText, Spacer, Vertical, View, WebGen, ButtonComponent, Box, Component } from "../../deps.ts";
import '../../assets/css/main.css';
import '../../assets/css/signin.css';
import heroImage from '../../assets/img/hero-img.png';
import googleLog from '../../assets/img/googleLogo.svg';
import { DynaNavigation } from "../../components/nav.ts";
import { Redirect, syncFromData } from "./helper.ts";
import { API } from "./RESTSpec.ts";
WebGen({
});
Redirect();

const para = new URLSearchParams(location.search);
const { id, type, state, code } = { id: para.get("id"), type: para.get("type"), state: para.get("state"), code: para.get("code") };

View<{ mode: "login" | "register" | "reset-password"; error?: string, signup?: boolean, resetToken?: string, loading: boolean, password: string; }>(({ state, update }) => Vertical(
    DynaNavigation("Home"),
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
                    return Page((formData) => [
                        Input({ placeholder: "New Password", type: "password", ...syncFromData(formData, "password") }),
                        Button("Reset your Password")
                            .setJustify("center")
                            .onPromiseClick(async () => {
                                await API.user(state.resetToken!).setMe.post({
                                    password: formData.get("password")?.toString()
                                });
                                update({ resetToken: undefined, password: formData.get("password")?.toString() });
                            }),
                        PlainText(state.resetToken?.startsWith("!") ? "Error: Link is invalid" : "").addClass("error-message")
                    ]).disableAutoSpacerAtBottom().getComponents();
                return Page((formData) => [
                    Button("Sign in with Google")
                        .setMargin("0 0 .8rem")
                        .setJustify("center")
                        .asLinkButton(`${API.BASE_URL}auth/google-redirect?redirect=${location.href}&type=google-auth`)
                        .addPrefix(Custom(img(googleLog)).addClass("prefix-logo")),
                    Horizontal(state.error ? PlainText(`Error: ${state.error}`).addClass("error-message") : null, Spacer()),
                    ...(<{ [ key in NonNullable<typeof state.mode> ]: Component[]; }>{
                        login: [
                            Input({ placeholder: "Email", type: "email", ...syncFromData(formData, "email") }),
                            Input({ placeholder: "Password", type: "password", ...syncFromData(formData, "password"), value: state.password }),
                            Button("Login")
                                .onPromiseClick(handleSignUpInButton(formData, state, update))
                                .setJustify("center"),
                            Horizontal(
                                PlainText("New here?"),
                                Button("Create a Account")
                                    .setStyle(ButtonStyle.Inline)
                                    .onClick(() => update({ mode: "register" }))
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
                                    .onClick(() => update({ mode: state.mode == "login" ? "reset-password" : "login" }))
                                    .addClass("link"),
                                Spacer()
                            )
                        ],
                        register: [
                            Input({ placeholder: "Name", type: "text", ...syncFromData(formData, "name") }),
                            Input({ placeholder: "Email", type: "email", ...syncFromData(formData, "email") }),
                            Input({ placeholder: "Password", type: "password", ...syncFromData(formData, "password"), value: state.password }),
                            Button("Register")
                                .onPromiseClick(handleSignUpInButton(formData, state, update))
                                .setJustify("center"),
                            Horizontal(
                                PlainText("Known here?"),
                                Button("Sign in")
                                    .setStyle(ButtonStyle.Inline)
                                    .onClick(() => update({ mode: "login" }))
                                    .setColor(Color.Colored)
                                    .addClass("link"),
                                Spacer()
                            )
                                .setMargin("1rem 0 0"),
                        ],
                        "reset-password": [
                            Input({ placeholder: "Email", type: "email", ...syncFromData(formData, "email") }),
                            Button("Reset")
                                .onPromiseClick(async () => {
                                    if (formData.get("email"))
                                        await API.auth.forgotPassword.post({
                                            email: formData.get("email")?.toString() ?? ""
                                        });
                                    else
                                        update({ error: "Email is missign" });

                                })
                                .setJustify("center"),
                            Horizontal(
                                PlainText("Known here?"),
                                Button("Sign in")
                                    .setStyle(ButtonStyle.Inline)
                                    .onClick(() => update({ mode: "login" }))
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
    .change(({ update }) => {
        update({ mode: "login" });
        if (type == "google" && state && code) {
            update({ loading: true });
            API.auth.google.post({ code, state }).then(async x => {
                localStorage[ "refresh-token" ] = x.refreshToken;
                localStorage[ "access-token" ] = (await API.auth.refreshAccessToken.post({ refreshToken: x.refreshToken })).accessToken;
                Redirect();
            });
        }
        if (type == "forgot-password" && id) {
            update({ loading: true });
            API.auth.fromEmail.get(id).then(async x => {
                localStorage[ "refresh-token" ] = x.refreshToken;
                localStorage[ "access-token" ] = (await API.auth.refreshAccessToken.post({ refreshToken: x.refreshToken })).accessToken;

                update({ resetToken: API.getToken(), loading: false });
            }).catch(() => {
                update({ resetToken: "!", loading: false });
            });
        }
    })
    .appendOn(document.body);

function handleSignUpInButton(formData: FormData, state: Partial<{ error?: string | undefined; signup?: boolean | undefined; }>, update: (data: Partial<{ error?: string | undefined; signup?: boolean | undefined; }>) => void): (env: MouseEvent, e: ButtonComponent) => Promise<void> {
    return async () => {
        const { name, email, password } = {
            email: formData.get("email")?.toString() ?? "",
            password: formData.get("password")?.toString() ?? "",
            name: formData.get("name")?.toString() ?? ""
        };
        let data: { refreshToken: string; } | null = null;
        if (state.signup)
            data = await API.auth.register.post({
                name,
                email,
                password
            });
        else
            data = await API.auth.email.post({
                email,
                password
            });

        if (!data)
            if (state.signup)
                update({ error: "Email is not unique/valid" });
            else
                update({ error: "Wrong Email or Password" });
        else {
            API.auth.refreshAccessToken.post({ refreshToken: data.refreshToken }).then(({ accessToken }) => {
                localStorage[ "access-token" ] = accessToken;
                localStorage[ "refresh-token" ] = data!.refreshToken;
            }).finally(() => {
                Redirect();
            });
        }
    };
}
