import bbnLogo from '../assets/img/bbnBig.svg';
import bbnMusicLogo from '../assets/img/bbnMusicBig.svg';

import '../assets/css/components/nav.css';
import { Box, Button, ButtonStyle, CenterV, Color, Component, createElement, Custom, Horizontal, img, PlainText, Spacer, Vertical } from "webgen/mod.ts";
import { IsLoggedIn, stringToColour } from "../pages/manager/helper.ts";
import { delay } from "https://deno.land/std@0.140.0/async/delay.ts";
import { API } from "../pages/manager/RESTSpec.ts";

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
export function DynaNavigation(type: "Home" | "Music" | "Settings", user = IsLoggedIn()) {
    return [
        user && user.email_verified != true ? Nav(Horizontal(
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
                CenterV(
                    Custom(img(type == "Music" ? bbnMusicLogo : bbnLogo)).onClick(() => { location.href = "/"; }),
                ),
                Spacer(),
                [
                    [ "Home", "/#" ],
                    [ "Services", "/#services" ],
                    [ "Team", "/#team" ],
                    [ "FAQ", "/#faq" ],
                    [ "News", "https://blog.bbn.one" ]
                ].map(([ text, link ]) =>
                    Button(text)
                        .asLinkButton(link)
                        .setStyle(ButtonStyle.Inline)
                ),
                (user
                    ? ProfilePicture(
                        user.picture ?
                            Custom(img(user?.picture))
                            : PlainText(getNameInital(user.name)),
                        user.name
                    )
                    : (type == "Home" ?
                        Button("Sign in")
                            .setColor(Color.Colored)
                            .addClass("contact")
                        : null)
                )
                    ?.onClick(() => { location.href = "/signin"; }) ?? null
            )
                .setMargin("0.5rem auto")
                .setGap("0.4rem"),
        ).addClass(type.toLowerCase())
    ];
}