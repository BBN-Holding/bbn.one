import bbnLogo from '../../assets/img/bbnBig.svg';
import '../../assets/css/components/nav.css';
import { link } from "../index/components/common.ts";
import { createElement, Custom, custom, img } from "../../deps.ts";

export function renderNav() {
    const nav = createElement('nav');

    const list = [
        [ "Home", "/" ],
        [ "Services", "/#services" ],
        [ "Team", "/#team" ],
        [ "FAQ", "/#faq" ],
        [ "News", "https://blog.bbn.one" ]
    ]

    const contactUs = custom('a', "Contact Us", "button") as HTMLAnchorElement;
    contactUs.href = "mailto:support@bbn.one";
    const shell = createElement('div')
    shell.append(img(bbnLogo), ...list.map((entry) => link(entry[ 0 ], entry[ 1 ])), contactUs)
    nav.append(shell)
    return Custom(nav);
}