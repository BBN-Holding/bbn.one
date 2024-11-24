import { delay } from "@std/async";
import { activeUser, IsLoggedIn, permCheck, showProfilePicture } from "shared/helper.ts";
import { API } from "shared/mod.ts";
import "webgen/assets/font/font.css";
import { Box, Color, Component, Content, css, Empty, Grid, Image, Label, MaterialIcon, mediaQueryRef, Popover, PrimaryButton } from "webgen/mod.ts";
import { activeTitle, NavigationType, pages } from "./pages.ts";

const isLightMode = mediaQueryRef("(prefers-color-scheme: light)");

const navMenuPopover = Popover(
    Box(
        activeUser.permission.map((perm) =>
            Grid(
                Label("SWITCH TO")
                    .setFontWeight("bold")
                    .setTextSize("xs")
                    .setMargin("2px 0"),
                ...pages.map(([logo, permission, route, login]) =>
                    permCheck(...permission) && (!login || (login == 1 && IsLoggedIn()) || (login == 2 && !IsLoggedIn()))
                        ? Grid(
                            Image(logo, "Logo").addClass("icon"),
                            MaterialIcon("arrow_forward_ios")
                                .setCssStyle("scale", ".8"),
                        )
                            .setTemplateColumns("12rem max-content")
                            .addClass("small-entry")
                            .onClick(() => location.pathname = route)
                        : Empty()
                ),
                perm.length
                    ? Grid(
                        Label("Go to Settings"),
                        MaterialIcon("arrow_forward_ios"),
                    )
                        .addClass("small-entry", "settings")
                        .onClick(() => location.href = "/settings")
                    : Empty(),
            )
        ),
    )
        .addClass("drop-over"),
);

navMenuPopover
    .setAttribute("theme", isLightMode.map((light) => light ? "light" : "dark"))
    .addStyle(css`
        :host([theme="light"]) .icon {
            filter: invert(.8);
        }
        .small-entry:hover {
            opacity: 0.7;
            cursor: pointer;
        }
    `);

function NavigationBar(type: NavigationType) {
    return Grid(
        Grid(
            MaterialIcon("apps"),
            Grid(
                Label(activeTitle(type))
                    .setFontWeight("bold")
                    .setTextSize("2xl")
                    .setMargin("0 2px 0 0"),
            ),
        )
            .setGap(".5rem")
            .setTemplateColumns("max-content max-content")
            .setAlignItems("center")
            .setJustifyContent("center")
            .addClass("nav-menu")
            .onClick(() => {
                if (!navMenuPopover.isOpen()) {
                    navMenuPopover.showPopover();
                }
            }),
        navMenuPopover.addClass("nav-menu-popover"),
        Box(
            activeUser.email.map((isLoggedIn) => {
                if (!isLoggedIn) {
                    if ((type === "Home" || type === "Music" || type === "Music-Landing") && !location.pathname.startsWith("/signin")) {
                        return PrimaryButton("Sign in")
                            .onClick(() => location.href = "/signin")
                            .addStyle(css`
                                :host {
                                    --wg-button-border-radius: var(--wg-radius-large);
                                    --wg-button-height: 30px;
                                    --wg-button-padding: 0 10px;
                                }
                            `);
                    }

                    return [];
                }

                return Grid(
                    showProfilePicture(IsLoggedIn()!).setWidth("29px").setHeight("29px"),
                    Label(activeUser.username.value)
                        .setFontWeight("bold"),
                    Empty(),
                )
                    .setGap(".7rem")
                    .setTemplateColumns("max-content max-content")
                    .setAlignItems("center")
                    .setCssStyle("cursor", "pointer")
                    .onClick(() => location.href = "/settings")
                    .addClass("profile-button");
            }),
        ),
    )
        .setTemplateColumns("max-content max-content")
        .setJustifyContent("space-between")
        .setMargin("5px 0");
}

export function EmailVerificationBanner() {
    return Grid(
        Label("Your Email is not verified. Please check your Inbox/Spam folder.")
            .setTextSize("sm")
            .setFontWeight("bold"),
        PrimaryButton("Resend Verify Email")
            .onPromiseClick(async () => {
                await API.user.mail.resendVerifyEmail.post();
                await delay(1000);
            })
            .setRadius("large")
            .addStyle(css`
                :host {
                    --wg-button-height: 22px;
                    --wg-button-padding: 0 2px;
                }
            `),
    )
        .setTemplateColumns("auto max-content")
        .setAlignItems("center")
        .setPadding("var(--wg-gap)")
        .setRadius("large")
        .addStyle(css`
            :host {
                background-color: ${new Color("red").mix(new Color("black"), 80)};
                color: red;
            }
        `);
}

export function DynaNavigation(type: NavigationType) {
    const Nav = (component: Component) => {
        const nav = document.createElement("nav");
        nav.append(component.draw());
        return { draw: () => nav };
    };

    return Box(
        Nav(
            Content(
                Grid(
                    NavigationBar(type),
                    Box(activeUser.emailVerified.map((verified) => verified === false ? EmailVerificationBanner() : [])),
                )
                    .setDirection("row")
                    .setMargin("0.5rem auto")
                    .setWidth("100%"),
            )
                .setContentMaxWidth("1230px")
                .addStyle(css`
                    .nav-menu {
                        anchor-name: --nav-menu-popover;
                        cursor: pointer;
                        user-select: none;
                    }
                    .nav-menu-popover {
                        position-anchor: --nav-menu-popover;
                        margin: unset;
                        top: anchor(bottom);
                        left: anchor(left);
                        border: none;
                        background: ${Color.reverseNeutral.toString()};
                        overflow: hidden;
                        padding: 5px 10px;
                        border-radius: var(--wg-radius-large);
                        box-shadow: var(--wg-shadow-5);
                    }
                `),
        ),
    )
        .setAttribute("type", type)
        .addStyle(css`
            :host {
                top: 0;
                position: sticky;
                z-index: 100;
            }
            :host([type="Music-Landing"]) {
                backdrop-filter: blur(10px);
            }
        `);
}
