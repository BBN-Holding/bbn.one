import { API, LoadingSpinner } from "shared";
import { assert } from "std/assert/assert.ts";
import { Box, Button, ButtonStyle, Color, Form, Grid, Horizontal, Image, Label, Spacer, TextInput, Vertical, View, WebGen, isMobile } from "webgen/mod.ts";
import '../../assets/css/main.css';
import { discordLogo, googleLogo } from "../../assets/imports.ts";
import { DynaNavigation } from "../../components/nav.ts";
import { RegisterAuthRefresh } from "../_legacy/helper.ts";
import { Footer } from "../shared/footer.ts";
import { handleStateChange, loginUser, registerUser } from "./actions.ts";
import './signin.css';
import { state } from "./state.ts";

await RegisterAuthRefresh();

WebGen();

const ErrorMessage = () => state.$error.map(() => state.error != undefined
    ? Label(state.error ?? "Please try again later.").addClass("error-message").setMargin("1rem 0 0")
    : Box()
)
    .asRefComponent()
    .removeFromLayout();

View(() => Vertical(
    DynaNavigation("Home"),
    Box().addClass("background-image"),
    Box(
        Grid(
            isMobile.map((small) =>
                Label("Welcome back!")
                    .setMargin("5rem 0 .8rem")
                    .addClass(small ? "no-custom" : "line-header", "header")
                    .setFont(small ? 4 : 5.375, 800)
            ).asRefComponent().removeFromLayout(),
            state.$type.map(() => {
                if (state.type == "reset-password-from-email")
                    return Form(Grid(
                        TextInput("password", "New Password")
                            .sync(state, "password"),
                        Button("Rest your Password")
                            .setId("submit-button")
                            .setJustify("center")
                            .onPromiseClick(async () => {
                                try {
                                    assert(API.getToken(), "Missing Token!");
                                    await API.user.setMe.post({
                                        password: state.password
                                    });
                                    state.type = 'login';
                                } catch (_) {
                                    state.error = "Failed: Please try again later";
                                }
                            }),
                        Label(API.getToken() ? "" : "Error: Link is invalid").addClass("error-message"),
                        ErrorMessage()
                    )).activeSubmitTo("#submit-button");
                if (state.type == "request-reset-password")
                    return Form(Grid(
                        TextInput("email", "Email")
                            .sync(state, "email")
                            .onChange(() => state.error = undefined)
                            .setAutofill("email")
                            .required()
                            .setMargin("0 0 .6rem"),

                        Button("Reset")
                            .onPromiseClick(async () => {
                                try {
                                    assert(state.email, "Email is missing");

                                    await API.auth.forgotPassword.post(state.email);

                                    alert("Email Send! Please check your Inbox/Spam folder.");
                                } catch (_) {
                                    state.error = _.message;
                                }
                            })
                            .setJustify("center"),

                        ErrorMessage(),

                        Horizontal(
                            Label("Known here?"),
                            Button("Sign in")
                                .setStyle(ButtonStyle.Inline)
                                .onClick(() => state.type = "login")
                                .setColor(Color.Colored)
                                .addClass("link"),
                            Spacer()
                        )
                            .setMargin("1rem 0 0"),
                    ));

                if (state.type == "login")
                    return Form(Grid(
                        Button("Sign in with Google")
                            .setJustify("center")
                            .asLinkButton(API.auth.oauthRedirect("google"))
                            .addPrefix(
                                Image(googleLogo, "Google Logo")
                                    .addClass("prefix-logo")
                            )
                            .setMargin("0 0 .6rem"),
                        Button("Sign in with Discord")
                            .setJustify("center")
                            .asLinkButton(API.auth.oauthRedirect("discord"))
                            .addPrefix(
                                Image(discordLogo, "Discord Logo")
                                    .addClass("prefix-logo")
                            )
                            // .setMargin("0 0 .6rem"),
                            // Button("Sign in with Microsoft")
                            // .setJustify("center")
                            // .asLinkButton(API.auth.oauthRedirect("microsoft"))
                            // .addPrefix(
                            //     Image(discordLogo, "logo")
                            //         .addClass("prefix-logo")
                            // )
                            .setMargin("0 0 2rem"),

                        TextInput("email", "Email")
                            .sync(state, "email")
                            .onChange(() => state.error = undefined)
                            .setAutofill("email")
                            .required()
                            .setMargin("0 0 .6rem"),

                        TextInput("password", "Password")
                            .sync(state, "password")
                            .onChange(() => state.error = undefined)
                            .setAutofill("current-password")
                            .required()
                            .setMargin("0 0 .6rem"),

                        Button("Login")
                            .setId("login-button")
                            .onPromiseClick(loginUser)
                            .setJustify("center"),

                        ErrorMessage(),

                        Horizontal(
                            Label("New here?"),
                            Button("Create an Account")
                                .setStyle(ButtonStyle.Inline)
                                .onClick(() => state.type = "register")
                                .setColor(Color.Colored)
                                .addClass("link"),
                            Spacer()
                        )
                            .setMargin("1.3rem 0 0"),

                        Horizontal(
                            Label("Forgot your Password?"),
                            Button("Reset it here")
                                .setStyle(ButtonStyle.Inline)
                                .setColor(Color.Colored)
                                .onClick(() => state.type = "request-reset-password")
                                .addClass("link"),
                            Spacer()
                        )
                    ))
                        .activeSubmitTo("#login-button");

                if (state.type == "register")
                    return Form(Grid(
                        TextInput("text", "Name")
                            .required()
                            .setAutofill("name")
                            .onChange(() => state.error = undefined)
                            .sync(state, "name")
                            .setMargin("0 0 .6rem"),

                        TextInput("email", "Email")
                            .setAutofill("email")
                            .required()
                            .onChange(() => state.error = undefined)
                            .sync(state, "email")
                            .setMargin("0 0 .6rem"),

                        TextInput("password", "Password")
                            .required()
                            .setAutofill("new-password")
                            .onChange(() => state.error = undefined)
                            .sync(state, "password")
                            .setMargin("0 0 .6rem"),

                        Button("Register")
                            .setId("register-button")
                            .onPromiseClick(registerUser)
                            .setJustify("center"),

                        ErrorMessage(),

                        Horizontal(
                            Label("Known here?"),
                            Button("Sign in")
                                .setStyle(ButtonStyle.Inline)
                                .onClick(() => state.type = "login")
                                .setColor(Color.Colored)
                                .addClass("link"),
                            Spacer()
                        )
                            .setMargin("1rem 0 0"),
                    ))
                        .activeSubmitTo("#register-button");

                return Box(
                    LoadingSpinner(),
                    Label("Loading..."),
                    ErrorMessage(),
                ).addClass("loading", "loader");
            }).asRefComponent(),
        )
    )
        .addClass("auth-area"),
    Footer()
))
    .appendOn(document.body);

await handleStateChange();
