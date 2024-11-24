import { assert } from "@std/assert";
import { Footer } from "shared/footer.ts";
import { RegisterAuthRefresh } from "shared/helper.ts";
import { API } from "shared/mod.ts";
import { appendBody, Box, Color, Content, css, EmailInput, Empty, FullWidthSection, Grid, Image, isMobile, Label, mediaQueryRef, PasswordInput, PrimaryButton, Spinner, TextButton, TextInput, WebGenTheme, WriteSignal } from "webgen/mod.ts";
import "../../assets/css/main.css";
import { googleLogo } from "../../assets/imports.ts";
import { DynaNavigation } from "../../components/nav.ts";
import { handleStateChange, loginUser } from "./actions.ts";
import { state } from "./state.ts";

// @deno-types="https://raw.githubusercontent.com/lucsoft-DevTeam/lucsoft.de/master/custom.d.ts"
import backgroundImage from "../holding./resources/background.jpg";

await RegisterAuthRefresh();
document.adoptedStyleSheets.push(css`
    body {
        --box-shadow-cta: 0 .824px 1.752px #db572124, 0 2.085px 4.43px #db572133, 0 4.253px 9.038px #db57213d, 0 8.76px 18.616px #db57214d, 0 24px 51px #db572170;
        --box-shadow-cta-hover: 0 1.237px .69px #db572145, 0 3.127px 5.113px #db572157, 0 6.38px 15.547px #db57215c, 0 13.141px 37.63px #db572163, 0 36px 100px #db572182;;
        --background-cta: linear-gradient(139deg, #e39123 6.59%, #db5721 101.73%);

        --background-free-tier: linear-gradient(139deg, #e3912333 6.59%, #db572133 101.73%), #0a0a0a;
        --badge-free-tier: linear-gradient(139deg,#d9881c73 6.59%,#c6451073 101.73%);
        --background-paid-tier: linear-gradient(139deg, #d9881c 6.59%, #c64510 101.73%);
        --badge-paid-tier: #00000040;
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
                        // if (type == "request-reset-password") {
                        //     return Form(Grid(
                        //         TextInput("email", "Email")
                        //             .ref(state.$email)
                        //             .onChange(() => state.error = undefined)
                        //             .setAutofill("email")
                        //             .required()
                        //             .setMargin("0 0 .6rem"),
                        //         Button("Reset")
                        //             .onPromiseClick(async () => {
                        //                 try {
                        //                     assert(state.email, "Email is missing");

                        //                     await API.auth.forgotPassword.post(state.email);

                        //                     alert("Email sent! Please check your Inbox/Spam folder.");
                        //                 } catch (_) {
                        //                     state.error = _.message;
                        //                 }
                        //             })
                        //             .setJustifyContent("center"),
                        //         ErrorMessage(),
                        //         Horizontal(
                        //             Label("Already have an account?"),
                        //             Button("Sign in")
                        //                 .setStyle(ButtonStyle.Inline)
                        //                 .onClick(() => state.type = "login")
                        //                 .setColor(Color.Colored)
                        //                 .addClass("link"),
                        //             Spacer(),
                        //         )
                        //             .setMargin("1rem 0 0"),
                        //     ));
                        // }

                        if (type == "login") {
                            return Grid(
                                PrimaryButton("Sign in with Google")
                                    .onClick(() => {
                                        location.href = API.auth.oauthRedirect("google");
                                    })
                                    .addPrefix(
                                        Image(googleLogo, "Google Logo")
                                            .setCssStyle("position", "absolute"),
                                    ),
                                PrimaryButton("Sign in with Discord")
                                    .onClick(() => {
                                        location.href = API.auth.oauthRedirect("discord");
                                    })
                                    // .addPrefix(
                                    //     Image(discordLogo, "Discord Logo")
                                    //         .setCssStyle("position", "absolute"),
                                    // )
                                    // LinkButton("Sign in with Microsoft", API.auth.oauthRedirect("microsoft"))
                                    //     .setJustifyContent("center")
                                    //     .addPrefix(
                                    //         Image(discordLogo, "logo")
                                    //             .addClass("prefix-logo")
                                    //     )
                                    .setMargin("0 0 1.3rem"),
                                EmailInput(state.email, "Email"),
                                // .onChange(() => state.error = undefined)
                                // .setAutofill("email")
                                // .required()
                                PasswordInput(state.password, "Password"),
                                // .onChange(() => state.error = undefined)
                                // .setAutofill("current-password")
                                // .required()
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

                        // if (type == "register") {
                        //     return Form(Grid(
                        //         TextInput("text", "Name")
                        //             .required()
                        //             .setAutofill("name")
                        //             .onChange(() => state.error = undefined)
                        //             .ref(state.$name)
                        //             .setMargin("0 0 .6rem"),
                        //         TextInput("email", "Email")
                        //             .setAutofill("email")
                        //             .required()
                        //             .onChange(() => state.error = undefined)
                        //             .ref(state.$email)
                        //             .setMargin("0 0 .6rem"),
                        //         TextInput("password", "Password")
                        //             .required()
                        //             .setAutofill("new-password")
                        //             .onChange(() => state.error = undefined)
                        //             .ref(state.$password)
                        //             .setMargin("0 0 .6rem"),
                        //         Button("Register")
                        //             .setId("register-button")
                        //             .onPromiseClick(registerUser)
                        //             .setJustifyContent("center"),
                        //         ErrorMessage(),
                        //         Horizontal(
                        //             Label("Already have an account?"),
                        //             Button("Sign in")
                        //                 .setStyle(ButtonStyle.Inline)
                        //                 .onClick(() => state.type = "login")
                        //                 .setColor(Color.Colored)
                        //                 .addClass("link"),
                        //             Spacer(),
                        //         )
                        //             .setMargin("1rem 0 0"),
                        //     ));
                        // }

                        return Box(
                            Spinner(),
                            Label("Loading..."),
                            ErrorMessage(state.error),
                        ).addClass("loading", "loader");
                    })),
                ),
            )
                .setMinHeight("100vh")
                .setCssStyle("placeItems", "center")
                .addClass("auth-area"),
            FullWidthSection(
                Footer(),
            ),
        ),
    )
        .setPrimaryColor(new Color("#eb8c2d")),
);

await handleStateChange();
