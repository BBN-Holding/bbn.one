import { API } from "shared";
import { delay } from "std/async/delay.ts";
import { Box, Button, ButtonStyle, CenterV, Color, Component, createElement, Custom, Grid, Horizontal, Icon, Image, img, MaterialIcons, PlainText, Reactive, Spacer, Vertical } from "webgen/mod.ts";
import { activeUser, IsLoggedIn, permCheck, showProfilePicture } from "../pages/manager/helper.ts";
import './nav.css';
import { activeLogo, pages } from "./pages.ts";
new MaterialIcons();
const Nav = (component: Component) => {
    const nav = createElement("nav");
    nav.append(component.draw());
    return Custom(nav);
};

const dropOver = Reactive(activeUser, "permission", () => Vertical(
    PlainText("SWITCH TO").addClass("title"),
    pages.map(([ logo, permission, route ]) => permCheck(...permission) ? Horizontal(
        Image(logo, "Logo"),
        Spacer(),
        Icon("arrow_forward_ios")
    )
        .addClass("small-entry")
        .onClick(() => location.href = route) : null
    ),
    Horizontal(
        PlainText("Go to Settings"),
        Spacer(),
        Icon("arrow_forward_ios")
    ).addClass("small-entry", "settings")
        .onClick(() => location.href = "/settings")
)
)
    .addClass("drop-over")
    .setId("drop-over")
    .draw();

dropOver.onblur = () => dropOver.classList.remove("open");
dropOver.tabIndex = 0;
export function DynaNavigation(type: "Home" | "Music" | "Settings" | "Hosting" | "Admin" | "Wallet", user = IsLoggedIn()) {
    return [
        user && user.profile.verified?.email != true ? Nav(Horizontal(
            CenterV(
                PlainText("Your Email is not verified. Please check your Inbox."),
            ),
            Spacer(),
            Button("Resend Verify Email")
                .addClass("link")
                .onPromiseClick(async () => {
                    await API.user(API.getToken()).mail.resendVerifyEmail.post();
                    await delay(1000);
                })
        )).addClass("email-banner", type.toLowerCase()) : Box(),
        Nav(
            Horizontal(
                Custom(dropOver),
                Vertical(
                    Icon("apps"),
                    Vertical(
                        Custom(img(activeLogo(type)))
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
                (user
                    ? Button(
                        Grid(
                            showProfilePicture(user),
                            PlainText(activeUser.$username),
                        )
                            .setRawColumns("max-content max-content")
                            .setAlign("center")
                            .setGap(".7rem")

                    )
                        .addClass("profile-button")
                        .setStyle(ButtonStyle.Inline)
                        .asLinkButton("/settings")
                    : (type == "Home" && !location.pathname.startsWith("/signin") ?
                        Button("Sign in")
                            .setColor(Color.Colored)
                            .addClass("contact")
                            .onClick(() => { location.href = "/signin"; })
                        : null)

                ) ?? null
            )
                .setMargin("0.5rem auto")
                .setGap("0.4rem"),
        ).addClass(type.toLowerCase())
    ];
}