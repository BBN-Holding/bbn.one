import bbnLogo from '../assets/img/bbnBig.svg';
import bbnMusicLogo from '../assets/img/bbnMusicBig.svg';

import '../assets/css/components/nav.css';
import { Button, ButtonStyle, Color, Component, createElement, Custom, Horizontal, img, PlainText, Spacer } from "../deps.ts";
import { ProfileData, stringToColour } from "../pages/manager/helper.ts";

const Nav = (component: Component) => {
    const nav = createElement("nav");
    nav.append(component.draw());
    return Custom(nav);
}

function getNameInital(name: string) {
    if (name.includes(", "))
        return name.split(", ").map(x => x.at(0)!.toUpperCase()).join("")
    if (name.includes(","))
        return name.split(",").map(x => x.at(0)!.toUpperCase()).join("")
    if (name.includes(" "))
        return name.split(" ").map(x => x.at(0)!.toUpperCase()).join("")
    return name.at(0)!.toUpperCase()
}
function ProfilePicture(component: Component, name: string) {
    const ele = component.draw()
    ele.style.backgroundColor = stringToColour(name);
    return Custom(ele).addClass("profile-picture")
}
export function DynaNavigation(type: "Home" | "Music", user?: ProfileData) {
    return Nav(
        Horizontal(
            Custom(img(type == "Home" ? bbnLogo : bbnMusicLogo)),
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
            type == "Home" ?
                Button("Contact Us")
                    .setColor(Color.Colored)
                    .addClass("contact") : null,
            user
                ? ProfilePicture(
                    user.picture ?
                        Custom(img(user?.picture))
                        : PlainText(getNameInital(user.name)),
                    user.name
                )
                : null
        ).setGap("0.4rem")
    ).addClass(type.toLowerCase())
}