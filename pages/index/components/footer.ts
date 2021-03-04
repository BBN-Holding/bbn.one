import { span } from "@lucsoft/webgen";
import '../../../assets/css/components/footer.css';
import bbnLogo from '../../../assets/img/bbn_logo.svg';
import { github, linkedIn, renderAction, twitter } from "./actions";

export function renderFooter()
{
    const data = document.createElement('article')
    data.classList.add('footer')

    const colOne = document.createElement('div')

    const logo = document.createElement('img');
    logo.src = bbnLogo;

    const bold = document.createElement('b')
    bold.innerText = "Email: "
    colOne.append(logo, bold, span("support@bbn.one"))

    const colTwo = document.createElement('div')

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
        link("Team", "#services"),
        link("FAQ", "#faq"),
        link("News", "https://blog.bbn.one"),
        link("Contact", "#contact"),
        link("Privacy policy", "/p/privacy.html"),
        link("Terms of Services", "/p/terms.html"),
        link("Imprint", "/p/imprint.html")
    ]
    colTwo.append(span("Useful Links"), ...list)

    const colThree = document.createElement('div')

    colThree.append(
        span("Our Social Networks"),
        span("Stay connected!"),
        ...renderAction([
            [ twitter, 'https://twitter.com/BigBotNetwork' ],
            [ github, 'https://github.com/BigBotNetwork/' ],
            [ linkedIn, 'https://www.linkedin.com/company/bbn0/' ]
        ]))
    data.append(colOne, colTwo, colThree)
    return data;
}