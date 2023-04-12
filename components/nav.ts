import bbnLogo from '../assets/img/bbnBig.svg';
import bbnMusicLogo from '../assets/img/bbnMusicBig.svg';
import bbnHostingLogo from '../assets/img/bbnHosting.svg';
import bbnAdminLogo from '../assets/img/bbnAdmin.svg';

import '../assets/css/components/nav.css';
import { Box, Button, ButtonStyle, CenterV, Color, Component, createElement, Custom, Horizontal, Icon, img, MaterialIcons, PlainText, Spacer, Vertical } from "webgen/mod.ts";
import { IsLoggedIn, stringToColour } from "../pages/manager/helper.ts";
import { delay } from "https://deno.land/std@0.167.0/async/delay.ts";
import { API } from "../pages/manager/RESTSpec.ts";
new MaterialIcons();
const Nav = (component: Component) => {
    const nav = createElement("nav");
    nav.append(component.draw());
    return Custom(nav);
};

function getNameInital(raw: string) {
    const name = raw.trim();
    if (name.includes(", "))
        return name.split(", ").map(x => x.at(0)?.toUpperCase()).join("");
    if (name.includes(","))
        return name.split(",").map(x => x.at(0)?.toUpperCase()).join("");
    if (name.includes(" "))
        return name.split(" ").map(x => x.at(0)?.toUpperCase()).join("");
    return name.at(0)!.toUpperCase();
}
function ProfilePicture(component: Component, name: string) {
    const ele = component.draw();
    ele.style.backgroundColor = stringToColour(name);
    return Custom(ele).addClass("profile-picture");
}
const dropOver = Box(Vertical(
    PlainText("SWITCH TO").addClass("title"),
    Horizontal(
        Custom(img(bbnLogo)),
        Spacer(),
        Icon("arrow_forward_ios")
    ).addClass("small-entry")
        .onClick(() => location.href = "/"),
    Horizontal(
        Custom(img(bbnMusicLogo)),
        Spacer(),
        Icon("arrow_forward_ios")
    ).addClass("small-entry")
        .onClick(() => location.href = "/music"),
    (API.permission.isReviewer(IsLoggedIn()) ? Horizontal(
        Custom(img(bbnAdminLogo)),
        Spacer(),
        Icon("arrow_forward_ios")
    ).addClass("small-entry")
        .onClick(() => location.href = "/admin") : null),
    Horizontal(
        PlainText("Go to Settings"),
        Spacer(),
        Icon("arrow_forward_ios")
    ).addClass("small-entry", "settings")
        .onClick(() => location.href = "/settings")
)
).addClass("drop-over").setId("drop-over").draw();

dropOver.onblur = () => dropOver.classList.remove("open");
dropOver.tabIndex = 0;
export function DynaNavigation(type: "Home" | "Music" | "Settings" | "Hosting" | "Admin", user = IsLoggedIn()) {
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
                        Custom(img(
                            (() => {
                                if (type == "Music")
                                    return bbnMusicLogo;
                                if (type == "Hosting")
                                    return bbnHostingLogo;
                                if (type == "Admin")
                                    return bbnAdminLogo;
                                return bbnLogo;
                            })()
                        )),
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
                [
                    [ "Home", "/#" ],
                    [ "Services", "/#services" ],
                    // [ "Team", "/#team" ],
                    [ "FAQ", "/#faq" ],
                    [ "News", "https://blog.bbn.one" ]
                ].map(([ text, link ]) =>
                    Button(text)
                        .asLinkButton(link)
                        .setStyle(ButtonStyle.Inline)
                ),
                (user
                    ? ProfilePicture(
                        user.profile.avatar ?
                            Custom(img(user.profile.avatar))
                            : PlainText(getNameInital(user.profile.username)),
                        user.profile.username
                    )
                    : (type == "Home" ?
                        Button("Sign in")
                            .setColor(Color.Colored)
                            .addClass("contact")
                        : null)
                )
                    ?.onClick(() => { location.href = "/settings"; }) ?? null
            )
                .setMargin("0.5rem auto")
                .setGap("0.4rem"),
        ).addClass(type.toLowerCase())
    ];
}