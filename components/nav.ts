import bbnLogo from '../assets/img/bbnBig.svg';
import bbnMusicLogo from '../assets/img/bbnMusicBig.svg';

import '../assets/css/components/nav.css';
import { Button, ButtonStyle, Color, Component, createElement, Custom, Horizontal, img, Spacer } from "../deps.ts";

const Nav = (component: Component) => {
    const nav = createElement("nav");
    nav.append(component.draw());
    return Custom(nav);
}

export function DynaNavigation(type: "Home" | "Music") {
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
                    .addClass("contact") : null
        ).setGap("0.4rem")
    ).addClass(type.toLowerCase())
}