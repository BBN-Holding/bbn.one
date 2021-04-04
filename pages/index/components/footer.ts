import { createElement, custom, img, span } from "@lucsoft/webgen";
import '../../../assets/css/components/footer.css';
import bbnLogo from '../../../assets/img/bbnSmall.svg';
import { github, linkedIn, renderAction, twitter } from "./actions";
import { link } from "./common";

export function renderFooter() {
    const data = custom('article', undefined, "footer")
    const shell = custom("div", data, "footer-background")
    const colOne = createElement('div')
    const label = span("Cluster wie ein Laster");
    label.style.display = "block";
    label.style.marginTop = ".5rem";
    colOne.append(img(bbnLogo), custom('b', "Email: "), span("support@bbn.one"), label)

    const colTwo = createElement('div')

    const list = [
        [ "Home", "#home" ],
        [ "Services", "#services" ],
        [ "Team", "#services" ],
        [ "FAQ", "#faq" ],
        [ "News", "https://blog.bbn.one" ],
        [ "Contact", "#contact" ],
        [ "Privacy Policy", "/p/privacy.html" ],
        [ "Terms of Use", "/p/terms.html" ],
        [ "Imprint", "/p/imprint.html" ]
    ]
    colTwo.append(span("Useful Links"), ...list.map(entry => link(entry[ 0 ], entry[ 1 ])))

    const colThree = createElement('div')

    colThree.append(
        span("Our Social Networks"),
        span("Stay connected!"),
        ...renderAction([
            [ twitter, 'https://twitter.com/BBN_Holding' ],
            [ github, 'https://github.com/BigBotNetwork/' ],
            [ linkedIn, 'https://www.linkedin.com/company/bbn0/' ]
        ]))
    data.append(colOne, colTwo, colThree)
    shell.append(data)
    return shell;
}
