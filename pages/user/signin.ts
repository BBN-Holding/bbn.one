import { assert } from "@std/assert";
import { Footer } from "shared/footer.ts";
import { RegisterAuthRefresh } from "shared/helper.ts";
import { API } from "shared/mod.ts";
import { appendBody, Box, Color, Content, css, EmailInput, Empty, FullWidthSection, Grid, Image, isMobile, Label, mediaQueryRef, PasswordInput, PrimaryButton, Spinner, TextButton, TextInput, WebGenTheme, WriteSignal } from "webgen/mod.ts";
import "../../assets/css/main.css";
import { discordLogo, googleLogo } from "../../assets/imports.ts";
import { DynaNavigation } from "../../components/nav.ts";
import { handleStateChange, loginUser, registerUser } from "./actions.ts";
import { state } from "./state.ts";

// @deno-types="https://raw.githubusercontent.com/lucsoft-DevTeam/lucsoft.de/master/custom.d.ts"
import backgroundImage from "../holding/resources/background.jpg";

await RegisterAuthRefresh();
document.adoptedStyleSheets.push(css`
    body {
        --bg-color: ${Color.reverseNeutral.mix(new Color("black"), 50)};
        background-color: var(--bg-color);
    }
`);

const ErrorMessage = (message: WriteSignal<string | undefined>) => message.value ? Label(message).setPadding("var(--wg-button-padding, 5px 10px)").setCssStyle("color", "red").setCssStyle("borderRadius", "var(--wg-checkbox-border-radius, var(--wg-radius-tiny))").setCssStyle("backgroundColor", "#2e0000") : Empty();

const isLightMode = mediaQueryRef("(prefers-color-scheme: light)");

appendBody(
    WebGenTheme(
        Content(
            FullWidthSection(
                DynaNavigation("Home"),
            ),
            FullWidthSection(
                Empty()
                    .setAttribute("theme", isLightMode.map((x) => x ? "light" : "dark"))
                    .addStyle(css`
                        :host {
                            position: absolute;
                            display: block;
                            inset: -0.5rem;
                            --image: url('${backgroundImage}');
                            background:
                                linear-gradient(180deg, rgba(0, 0, 0, 0.61) 0%, var(--bg-color) 77.08%, var(--bg-color) 100%),
                                var(--image) no-repeat center center;
                            background-size: cover;
                            filter: blur(4.5px);
                            z-index: -1;
                        }
                        :host([theme=light]) {
                            background:
                                linear-gradient(180deg, rgba(255, 255, 255, 0.61) 0%, #f3f5fa 77.08%, #f3f5fa 100%),
                                var(--image) no-repeat center center;
                            background-size: cover;
                        }
                    `),
            ),
            Grid(
                Grid(
                    isMobile.map((small) =>
                        Label("Welcome back!")
                            .setMaxWidth("21rem")
                            .setMargin("5rem 0 .8rem")
                            .setFontWeight("extrabold")
                            .setTextSize(small ? "6xl" : "7xl")
                            .setCssStyle("lineHeight", small ? "var(--wg-lineheight-${6xl})" : "94px")
                    ),
                    Box(state.type.map((type) => {
                        if (type == "reset-password-from-email") {
                            return Box(Grid(
                                TextInput(state.password, "New Password"),
                                PrimaryButton("Reset your Password")
                                    .onPromiseClick(async () => {
                                        try {
                                            assert(API.getToken(), "Missing Token!");
                                            await API.user.setMe.post({
                                                password: state.password.value,
                                            });
                                            state.type.setValue("login");
                                        } catch (_) {
                                            state.error.setValue("Failed: Please try again later");
                                        }
                                    })
                                    .setId("submit-button")
                                    .setJustifyContent("center"),
                                Label(API.getToken() ? "" : "Error: Link is invalid").addClass("error-message"),
                                ErrorMessage(state.error),
                            ));
                        }

                        if (type == "request-reset-password") {
                            return Grid(
                                EmailInput(state.email, "Email")
                                    .setMargin("0 0 .6rem"),
                                PrimaryButton("Reset")
                                    .onPromiseClick(async () => {
                                        try {
                                            assert(state.email, "Email is missing");

                                            await API.auth.forgotPassword.post(state.email.value);

                                            alert("Email sent! Please check your Inbox/Spam folder.");
                                        } catch (err) {
                                            state.error.setValue(err.message);
                                        }
                                    })
                                    .setJustifyContent("center"),
                                ErrorMessage(state.error),
                                Grid(
                                    Label("Already have an account?"),
                                    TextButton("Sign in")
                                        .onClick(() => state.type.setValue("login")),
                                )
                                    .setTemplateColumns("auto auto"),
                            ).setGap();
                        }

                        if (type == "login") {
                            return Grid(
                                PrimaryButton("Sign in with Google")
                                    .addPrefix(
                                        Image(googleLogo, "Google Logo")
                                            .setCssStyle("scale", ".9"),
                                    )
                                    .onClick(() => {
                                        location.href = API.auth.oauthRedirect("google");
                                    }),
                                PrimaryButton("Sign in with Discord")
                                    .addPrefix(
                                        Image(discordLogo, "Discord Logo")
                                            .setWidth("20px"),
                                    )
                                    .onClick(() => {
                                        location.href = API.auth.oauthRedirect("discord");
                                    })
                                    // LinkButton("Sign in with Microsoft", API.auth.oauthRedirect("microsoft"))
                                    //     .setJustifyContent("center")
                                    //     .addPrefix(
                                    //         Image(discordLogo, "logo")
                                    //             .addClass("prefix-logo")
                                    //     )
                                    .setMargin("0 0 1.3rem"),
                                EmailInput(state.email, "Email"),
                                PasswordInput(state.password, "Password"),
                                PrimaryButton("Login")
                                    .onPromiseClick(async () => await loginUser())
                                    .setId("login-button")
                                    .setJustifyContent("center"),
                                ErrorMessage(state.error),
                                Grid(
                                    Label("New here?"),
                                    TextButton("Create an Account")
                                        .onClick(() => state.type.setValue("register")),
                                ).setTemplateColumns("auto auto"),
                                Grid(
                                    Label("Forgot your Password?"),
                                    TextButton("Reset it here")
                                        .onClick(() => state.type.setValue("request-reset-password")),
                                ).setTemplateColumns("auto auto"),
                            ).setGap();
                        }

                        if (type == "register") {
                            return Grid(
                                TextInput(state.name, "Name"),
                                EmailInput(state.email, "Email"),
                                PasswordInput(state.password, "Password"),
                                PrimaryButton("Register")
                                    .onPromiseClick(registerUser)
                                    .setJustifyContent("center"),
                                ErrorMessage(state.error),
                                Grid(
                                    Label("Already have an account?"),
                                    TextButton("Sign in")
                                        .onClick(() => state.type.setValue("login"))
                                        .addClass("link"),
                                ).setTemplateColumns("auto auto"),
                            ).setGap();
                        }

                        return Grid(
                            Spinner(),
                            Label("Loading..."),
                            ErrorMessage(state.error),
                        ).setGap().addClass("loading", "loader");
                    })),
                ),
            )
                .setMinHeight("100vh")
                .setCssStyle("placeItems", "center"),
            FullWidthSection(
                Footer(),
            ),
        ),
    )
        .setPrimaryColor(new Color("#eb8c2d")),
);

await handleStateChange();
