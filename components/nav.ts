import { delay } from "@std/async";
import { activeUser, IsLoggedIn, permCheck, showProfilePicture } from "shared/helper.ts";
import { API } from "shared/mod.ts";
import { Box, Component, Empty, Grid, Label, MaterialIcon, Popover, PrimaryButton } from "webgen/mod.ts";
import "./nav.css";
import { activeTitle, pages } from "./pages.ts";

const navMenuPopover = Popover(
    Box(
        activeUser.permission.map((perm) =>
            Grid(
                Label("SWITCH TO").addClass("title"),
                ...pages.map(([logo, permission, route, login]) =>
                    permCheck(...permission) && (!login || (login == 1 && IsLoggedIn()) || (login == 2 && !IsLoggedIn()))
                        ? Grid(
                            // Image(logo, "Logo"),
                            // Spacer(),
                            MaterialIcon("arrow_forward_ios"),
                        )
                            .addClass("small-entry")
                            .onClick(() => location.pathname = route)
                        : Empty()
                ),
                perm.length
                    ? Grid(
                        Label("Go to Settings"),
                        // Spacer(),
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

export function DynaNavigation(type: "Home" | "Music" | "Settings" | "Hosting" | "Admin" | "Wallet") {
    const Nav = (component: Component) => {
        const nav = document.createElement("nav");
        nav.append(component.draw());
        nav.classList.add("nav", type.toLowerCase());
        return { draw: () => nav };
    };

    return Nav(
        Grid(
            Grid(
                Grid(
                    MaterialIcon("apps"),
                    Grid(
                        Label(activeTitle(type))
                            .setFontWeight("bold")
                            .setTextSize("2xl")
                            .setMargin("2px 0 0"),
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
                // Spacer(),
                (activeUser.email.map((email) =>
                    email
                        ? Grid(
                            showProfilePicture(IsLoggedIn()!).setWidth("29px").setHeight("29px"),
                            Label(activeUser.username.value)
                                .setFontWeight("bold"),
                            Empty(),
                        )
                            .setGap(".7rem")
                            .setTemplateColumns("max-content max-content")
                            .setAlignItems("center")
                            .onClick(() => location.href = "/settings")
                            .addClass("profile-button")
                        : ((type === "Home" || type === "Music") && !location.pathname.startsWith("/signin")
                            ? PrimaryButton("Sign in")
                                .onClick(() => location.href = "/signin")
                                .addClass("login-button")
                            : Empty())
                ).value) ?? null,
            ),
            IsLoggedIn() && IsLoggedIn()!.profile.verified?.email != true
                ? Grid(
                    Label("Your Email is not verified. Please check your Inbox/Spam folder.").addClass("label"),
                    PrimaryButton("Resend Verify Email")
                        .onPromiseClick(async () => {
                            await API.user.mail.resendVerifyEmail.post();
                            await delay(1000);
                        })
                        .addClass("link"),
                ).addClass("email-banner", type.toLowerCase())
                : Empty(),
        )
            .setGap("0.4rem")
            .setMargin("0.5rem auto"),
    );
}
