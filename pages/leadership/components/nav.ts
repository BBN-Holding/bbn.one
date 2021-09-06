import bbnLogo from '../../../assets/img/bbnBig.svg';
import '../../../assets/css/components/nav.css';
import { link } from "../../index/components/common";
import { createElement, custom, img } from "@lucsoft/webgen";

export function renderNav() {
    const nav = createElement('nav');

    const list = [
        [ "Home", "https://bbn.one/#home" ],
        [ "Services", "https://bbn.one/#services" ],
        [ "Team", "https://bbn.one/#team" ],
        [ "FAQ", "https://bbn.one/#faq" ],
        [ "News", "https://blog.bbn.one" ]
    ]

    const contactUs = custom('a', "Contact Us", "button") as HTMLAnchorElement;
    contactUs.href = "mailto:support@bbn.one";
    const shell = createElement('div')
    shell.append(img(bbnLogo), ...list.map((entry) => link(entry[ 0 ], entry[ 1 ])), contactUs)
    nav.append(shell)
    return nav;
}