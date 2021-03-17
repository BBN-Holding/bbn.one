import bbnLogo from '../../../assets/img/bbn_logo.svg';
import '../../../assets/css/components/nav.css';
import { link } from "./common";
import { createElement, custom } from "@lucsoft/webgen";

export function renderNav()
{
    const nav = createElement('nav');

    const logo = createElement('img') as HTMLImageElement;
    logo.src = bbnLogo;

    const list = [
        [ "Home", "#home" ],
        [ "Services", "#services" ],
        [ "Team", "#team" ],
        [ "FAQ", "#faq" ],
        [ "News", "https://blog.bbn.one" ],
        [ "Contact", "mailto:support@bbn.one" ]
    ]

    const learnMore = custom('a', "Learn More", "button") as HTMLAnchorElement;
    learnMore.href = "#services";
    const shell = createElement('div')
    shell.append(logo, ...list.map((entry) => link(entry[ 0 ], entry[ 1 ])), learnMore)
    nav.append(shell)
    return nav;
}