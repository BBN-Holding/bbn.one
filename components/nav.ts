import { delay } from "@std/async";
import { activeUser, IsLoggedIn, permCheck, showProfilePicture } from "shared/helper.ts";
import { API } from "shared/mod.ts";
import "webgen/assets/font/font.css";
import { Box, Color, Component, Content, css, Empty, Grid, Image, Label, MaterialIcon, Popover, PrimaryButton } from "webgen/mod.ts";
import { activeTitle, NavigationType, pages } from "./pages.ts";

const navMenuPopover = Popover(
    Box(
        Label("sdf"),
        activeUser.permission.map((perm) =>
            Grid(
                Label("SWITCH TO").addClass("title"),
                ...pages.map(([logo, permission, route, login]) =>
                    permCheck(...permission) && (!login || (login == 1 && IsLoggedIn()) || (login == 2 && !IsLoggedIn()))
                        ? Grid(
                            Image(logo, "Logo"),
                            MaterialIcon("arrow_forward_ios"),
                        )
                            .addClass("small-entry")
                            .onClick(() => location.pathname = route)
                        : Empty()
                ),
                perm.length
                    ? Grid(
                        Label("Go to Settings"),
                        MaterialIcon("arrow_forward_ios"),
                    ).addClass("small-entry", "settings")
                        .onClick(() => location.href = "/settings")
                    : Empty(),
            )
        )
            .value,
    )
        .addClass("drop-over"),
);
// .pullingAnchorPositioning("--nav-menu-popover", (rect, style) => {
//     style.top = `max(-5px, ${rect.bottom}px)`;
//     style.left = `${rect.left}px`;
//     style.minWidth = `${rect.width}px`;
//     style.bottom = "var(--gap)";
//     style.height = "min-content";
// });

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
            .addClass("clickable")
            .setAnchorName("--nav-menu-popover")
            .onClick(() => {
                navMenuPopover.showPopover();
            }),
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
                    .setGap("0.4rem")
                    .setDirection("row")
                    .setMargin("0.5rem auto")
                    .setWidth("100%"),
            )
                .setContentMaxWidth("1230px"),
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
