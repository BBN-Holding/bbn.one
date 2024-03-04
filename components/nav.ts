import { API } from "shared/mod.ts";
import { delay } from "std/async/delay.ts";
import { BasicLabel, Box, Button, ButtonStyle, Component, Custom, Empty, Grid, Horizontal, Image, Label, LinkButton, MIcon, Spacer, Vertical, createElement } from "webgen/mod.ts";
import { Popover } from "webgen/src/components/Popover.ts";
import { IsLoggedIn, activeUser, permCheck, showProfilePicture } from "../pages/_legacy/helper.ts";
import './nav.css';
import { activeTitle, pages } from "./pages.ts";

const Nav = (component: Component) => {
    const nav = createElement("nav");
    nav.append(component.draw());
    return Custom(nav);
};

const navMenuPopover = Popover(
    Box(
        activeUser.$permission.map(() => Vertical(
            Label("SWITCH TO").addClass("title"),
            pages.map(([ logo, permission, route ]) => permCheck(...permission)
                ? Horizontal(
                    Image(logo, "Logo"),
                    Spacer(),
                    MIcon("arrow_forward_ios")
                )
                    .addClass("small-entry")
                    .onClick(() => location.pathname = route)
                : Empty()
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

)
    .pullingAnchorPositioning("--nav-menu-popover", (rect, style) => {
        style.top = `max(-5px, ${rect.bottom}px)`;
        style.left = `${rect.left}px`;
        style.minWidth = `${rect.width}px`;
        style.bottom = "var(--gap)";
        style.height = "min-content";
    });

export function DynaNavigation(type: "Home" | "Music" | "Settings" | "Hosting" | "Admin" | "Wallet") {
    return Nav(
        Grid(
            Horizontal(
                Vertical(
                    MIcon("apps"),
                    Vertical(
                        Label(activeTitle(type))
                            .setFontWeight("bold")
                            .setTextSize("2xl")
                            .setMargin("2px 0 0")
                    ),
                )
                    .setGap(".5rem")
                    .setDirection("row")
                    .setAlignItems("center")
                    .setJustifyContent("center")
                    .addClass("clickable")
                    .setAnchorName("--nav-menu-popover")
                    .onClick(() => {
                        navMenuPopover.showPopover();
                    }),
                Spacer(),
                (activeUser.$email.map(email => email ?
                    LinkButton(
                        Grid(
                            showProfilePicture(IsLoggedIn()!),
                            Label(activeUser.$username)
                                .setFontWeight("bold"),
                        )
                            .setRawColumns("max-content max-content")
                            .setAlignItems("center")
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