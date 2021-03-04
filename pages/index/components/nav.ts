import bbnLogo from '../../../assets/img/bbn_logo.svg';
import '../../../assets/css/components/nav.css';

export function renderNav()
{
    const nav = document.createElement('nav');

    const logo = document.createElement('img');
    logo.src = bbnLogo;

    const link = (name: string, id: string) =>
    {
        const link = document.createElement('a');
        link.innerText = name;
        link.href = id;
        return link;
    }
    const list = [
        link("Home", "#home"),
        link("Services", "#services"),
        link("Team", "#team"),
        link("FAQ", "#faq"),
        link("News", "https://blog.bbn.one"),
        link("Contact", "mailto:support@bbn.one")
    ]
    const learnMore = document.createElement('a');
    learnMore.innerText = "Learn More";
    learnMore.classList.add("button")
    learnMore.href = "#services";
    const shell = document.createElement('div')
    shell.append(logo, ...list, learnMore)
    nav.append(shell)
    return nav;
}