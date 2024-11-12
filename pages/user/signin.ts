import { assert } from "@std/assert";
import { Footer } from "shared/footer.ts";
import { RegisterAuthRefresh } from "shared/helper.ts";
import { API, LoadingSpinner } from "shared/mod.ts";
import { Body, Box, Button, ButtonStyle, Color, Component, createElement, Custom, Grid, Horizontal, Image, isMobile, Label, LinkButton, Spacer, TextInput, Vertical } from "webgen/mod.ts";
import "../../assets/css/main.css";
import { discordLogo, googleLogo } from "../../assets/imports.ts";
import { DynaNavigation } from "../../components/nav.ts";
import { handleStateChange, loginUser, registerUser } from "./actions.ts";
import "./signin.css";
import { state } from "./state.ts";

await RegisterAuthRefresh();

export const Form = (ele: Component) => {
    const form = createElement("form");
    form.append(ele.draw());
    form.addEventListener("submit", (e: Event) => {
        e.preventDefault();
        if (!form.reportValidity()) return;
        form.querySelector<HTMLElement>("#submit-button")?.click();
    });
    return Custom(form);
};

const ErrorMessage = () =>
    state.$error.map((error) => error != undefined ? Label(error ?? "Please try again later.").addClass("error-message").setMargin("1rem 0 0") : Box())
        .asRefComponent()
        .removeFromLayout();

Body(Vertical(
    DynaNavigation("Home"),
    Box().addClass("background-image"),
    Box(
        Grid(
            isMobile.map((small) =>
                Label("Welcome back!")
                    .setMargin("5rem 0 .8rem")
                    .addClass(small ? "no-custom" : "line-header", "header")
                    .setFontWeight("extrabold")
                    .setTextSize(small ? "6xl" : "7xl")
            ).asRefComponent().removeFromLayout(),
            state.$type.map((type) => {
                if (type == "reset-password-from-email") {
                    return Form(Grid(
                        TextInput("password", "New Password")
                            .ref(state.$password),
                        Button("Reset your Password")
                            .setId("submit-button")
                            .setJustifyContent("center")
                            .onPromiseClick(async () => {
                                try {
                                    assert(API.getToken(), "Missing Token!");
                                    await API.user.setMe.post({
                                        password: state.password,
                                    });
                                    state.type = "login";
                                } catch (_) {
                                    state.error = "Failed: Please try again later";
                                }
                            }),
                        Label(API.getToken() ? "" : "Error: Link is invalid").addClass("error-message"),
                        ErrorMessage(),
                    ));
                }
                if (type == "request-reset-password") {
                    return Form(Grid(
                        TextInput("email", "Email")
                            .ref(state.$email)
                            .onChange(() => state.error = undefined)
                            .setAutofill("email")
                            .required()
                            .setMargin("0 0 .6rem"),
                        Button("Reset")
                            .onPromiseClick(async () => {
                                try {
                                    assert(state.email, "Email is missing");

                                    await API.auth.forgotPassword.post(state.email);

                                    alert("Email sent! Please check your Inbox/Spam folder.");
                                } catch (_) {
                                    state.error = _.message;
                                }
                            })
                            .setJustifyContent("center"),
                        ErrorMessage(),
                        Horizontal(
                            Label("Already have an account?"),
                            Button("Sign in")
                                .setStyle(ButtonStyle.Inline)
                                .onClick(() => state.type = "login")
                                .setColor(Color.Colored)
                                .addClass("link"),
                            Spacer(),
                        )
                            .setMargin("1rem 0 0"),
                    ));
                }

                if (type == "login") {
                    return Form(Grid(
                        LinkButton("Sign in with Google", API.auth.oauthRedirect("google"))
                            .setJustifyContent("center")
                            .addPrefix(
                                Image(googleLogo, "Google Logo")
                                    .addClass("prefix-logo"),
                            )
                            .setMargin("0 0 .6rem"),
                        LinkButton("Sign in with Discord", API.auth.oauthRedirect("discord"))
                            .setJustifyContent("center")
                            .addPrefix(
                                Image(discordLogo, "Discord Logo")
                                    .addClass("prefix-logo"),
                            )
                            //     .setMargin("0 0 .6rem"),
                            // LinkButton("Sign in with Microsoft", API.auth.oauthRedirect("microsoft"))
                            //     .setJustifyContent("center")
                            //     .addPrefix(
                            //         Image(discordLogo, "logo")
                            //             .addClass("prefix-logo")
                            //     )
                            .setMargin("0 0 2rem"),
                        TextInput("email", "Email")
                            .ref(state.$email)
                            .onChange(() => state.error = undefined)
                            .setAutofill("email")
                            .required()
                            .setMargin("0 0 .6rem"),
                        TextInput("password", "Password")
                            .ref(state.$password)
                            .onChange(() => state.error = undefined)
                            .setAutofill("current-password")
                            .required()
                            .setMargin("0 0 .6rem"),
                        Button("Login")
                            .setId("login-button")
                            .onPromiseClick(async () => await loginUser())
                            .setJustifyContent("center"),
                        ErrorMessage(),
                        Horizontal(
                            Label("New here?"),
                            Button("Create an Account")
                                .setStyle(ButtonStyle.Inline)
                                .onClick(() => state.type = "register")
                                .setColor(Color.Colored)
                                .addClass("link"),
                            Spacer(),
                        )
                            .setMargin("1.3rem 0 0"),
                        Horizontal(
                            Label("Forgot your Password?"),
                            Button("Reset it here")
                                .setStyle(ButtonStyle.Inline)
                                .setColor(Color.Colored)
                                .onClick(() => state.type = "request-reset-password")
                                .addClass("link"),
                            Spacer(),
                        ),
                    ));
                }

                if (type == "register") {
                    return Form(Grid(
                        TextInput("text", "Name")
                            .required()
                            .setAutofill("name")
                            .onChange(() => state.error = undefined)
                            .ref(state.$name)
                            .setMargin("0 0 .6rem"),
                        TextInput("email", "Email")
                            .setAutofill("email")
                            .required()
                            .onChange(() => state.error = undefined)
                            .ref(state.$email)
                            .setMargin("0 0 .6rem"),
                        TextInput("password", "Password")
                            .required()
                            .setAutofill("new-password")
                            .onChange(() => state.error = undefined)
                            .ref(state.$password)
                            .setMargin("0 0 .6rem"),
                        Button("Register")
                            .setId("register-button")
                            .onPromiseClick(registerUser)
                            .setJustifyContent("center"),
                        ErrorMessage(),
                        Horizontal(
                            Label("Already have an account?"),
                            Button("Sign in")
                                .setStyle(ButtonStyle.Inline)
                                .onClick(() => state.type = "login")
                                .setColor(Color.Colored)
                                .addClass("link"),
                            Spacer(),
                        )
                            .setMargin("1rem 0 0"),
                    ));
                }

                return Box(
                    LoadingSpinner(),
                    Label("Loading..."),
                    ErrorMessage(),
                ).addClass("loading", "loader");
            }).asRefComponent(),
        ),
    ).addClass("auth-area"),
    Footer(),
));

await handleStateChange();
