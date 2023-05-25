import { API } from "shared";
import { delay } from "std/async/delay.ts";
import { Box, Button, ButtonStyle, CenterV, Color, Component, Custom, Horizontal, Icon, MaterialIcons, PlainText, Reactive, Spacer, Vertical, createElement, img } from "webgen/mod.ts";
import '../assets/css/components/nav.css';
import { IsLoggedIn, activeUser, permCheck, stringToColour } from "../pages/manager/helper.ts";
import { activeLogo, pages } from "./pages.ts";
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

const dropOver = Reactive(activeUser, "permission", () => Vertical(
    PlainText("SWITCH TO").addClass("title"),
    pages.map(([ logo, permission, route ]) => permCheck(...permission) ? Horizontal(
        Custom(img(logo)),
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
                        Custom(img(
                            activeLogo(type)
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
                    ).onClick(() => { location.href = "/settings"; })
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