import { Custom, View, WebGen } from "@lucsoft/webgen";
import { renderNav } from "./components/nav";
import { renderOpener } from "./components/opener";
import { renderPartner } from "./components/partner";
import { renderServices } from "./components/services";
import { renderTeam } from "./components/team";
import { renderFAQ } from "./components/faq";
import { renderFooter } from "./components/footer";
WebGen({ autoLoadFonts: false });
import '../../assets/css/main.css';

View(({ draw }) => {
    draw(renderNav())
    draw(renderOpener())
    draw(renderPartner())
    draw(renderServices())
    draw(renderTeam())
    draw(renderFAQ())
    draw(renderFooter())
})
    .appendOn(document.body)
