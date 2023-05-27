import { createElement, Custom, custom, img, PlainText } from "webgen/mod.ts";
import bbnLogo from '../assets/img/bbnSmall.svg';
import { actions, link, renderAction } from "./actions.ts";
import './footer.css';

// TODO: Refactor this to stack based layout
export function renderFooter() {
    const data = custom('article', undefined, "footer");
    const shell = custom("div", data, "footer-background");
    const colOne = createElement('div');
    const label = PlainText("Cluster wie ein Laster").draw();
    label.style.display = "block";
    label.style.marginTop = ".5rem";
    colOne.append(img(bbnLogo), custom('b', "E-Mail: "), PlainText("support@bbn.one").draw(), label);

    const colTwo = createElement('div');

    const list = [
        [ "Home", "/" ],
        [ "News", "https://blog.bbn.one" ],
        [ "Contact", "mailto:support@bbn.one" ],
        [ "Service Status", "https://status.bbn.one" ],
        [ "Privacy Policy", "/p/privacy.html" ],
        [ "Terms of Use", "/p/terms.html" ],
        [ "Distribution Agreement", "/p/distribution.html" ],
        [ "Imprint", "/p/imprint.html" ]
    ];
    colTwo.append(PlainText("Useful Links").draw(), ...list.map(entry => link(entry[ 0 ], entry[ 1 ])));

    const colThree = createElement('div');

    colThree.append(
        PlainText("Our Social Networks").draw(),
        PlainText("Stay connected!").draw(),
        ...renderAction([
            [ actions.twitter, 'https://twitter.com/BBN_Holding' ],
            [ actions.github, 'https://github.com/bbn-holding/' ],
            [ actions.linkedIn, 'https://www.linkedin.com/company/bbn0/' ]
        ]));
    data.append(colOne, colTwo, colThree);
    shell.append(data);
    return Custom(shell).setMargin("5rem 0 0");
}
