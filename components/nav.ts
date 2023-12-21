import { API } from "shared/mod.ts";
import { delay } from "std/async/delay.ts";
import { BasicLabel, Box, Button, ButtonStyle, Component, Custom, Empty, Grid, Horizontal, Image, Label, LinkButton, MIcon, Spacer, Vertical, createElement } from "webgen/mod.ts";
import { IsLoggedIn, activeUser, permCheck, showProfilePicture } from "../pages/_legacy/helper.ts";
import './nav.css';
import { activeLogo, pages } from "./pages.ts";

const Nav = (component: Component) => {
    const nav = createElement("nav");
    nav.append(component.draw());
    return Custom(nav);
};

const dropOver = Box(activeUser.$permission.map(() => Vertical(
    Label("SWITCH TO").addClass("title"),
    pages.map(([ logo, permission, route ]) => permCheck(...permission) ? Horizontal(
        Image(logo, "Logo"),
        Spacer(),
        MIcon("arrow_forward_ios")
    )
        .addClass("small-entry")
        .onClick(() => location.href = route) : null
    ),
    Horizontal(
        Label("Go to Settings"),
        Spacer(),
        MIcon("arrow_forward_ios")
    ).addClass("small-entry", "settings")
        .onClick(() => location.href = "/settings")
))
    .asRefComponent()
)
    .addClass("drop-over")
    .draw();

dropOver.onblur = () => dropOver.classList.remove("open");
dropOver.tabIndex = 0;
export function DynaNavigation(type: "Home" | "Music" | "Settings" | "Hosting" | "Admin" | "Wallet") {
    return Nav(
        Grid(
            Horizontal(
                Custom(dropOver),
                Vertical(
                    MIcon("apps"),
                    Vertical(
                        Image(activeLogo(type), "Selected Service")
                    ),
                )
                    .setGap(".5rem")
                    .setDirection("row")
                    .setAlign("center")
                    .addClass("justify-content-center", "clickable")
                    .onClick(() => {
                        dropOver.classList.add("open");
                        dropOver.focus();
                    }),
                Spacer(),
                (activeUser.$email.map(email => email ?
                    LinkButton(
                        Grid(
                            showProfilePicture(IsLoggedIn()!),
                            Label(activeUser.$username),
                        )
                            .setRawColumns("max-content max-content")
                            .setAlign("center")
                            .setGap(".7rem"),
                        "/settings"
                    )
                        .addClass("profile-button")
                        .setStyle(ButtonStyle.Inline)
                    :
                    (type == "Home" && !location.pathname.startsWith("/signin") ?
                        LinkButton("Sign in", "/signin")
                            .addClass("login-button")
                        : Box())
                ).asRefComponent()
                ) ?? null,
            ),
            IsLoggedIn() && IsLoggedIn()!.profile.verified?.email != true ? Grid(
                BasicLabel({
                    title: "Your Email is not verified. Please check your Inbox/Spam folder."
                }).addClass("label"),
                Button("Resend Verify Email")
                    .addClass("link")
                    .onPromiseClick(async () => {
                        await API.user.mail.resendVerifyEmail.post();
                        await delay(1000);
                    })
            ).addClass("email-banner", type.toLowerCase()) : Empty(),
        )
            .setMargin("0.5rem auto")
            .setGap("0.4rem"),
    ).addClass(type.toLowerCase());
}