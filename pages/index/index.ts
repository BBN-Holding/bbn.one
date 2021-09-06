import { View, WebGen } from "@lucsoft/webgen";
import { renderNav } from "./components/nav";
import { renderOpener } from "./components/opener";
import { renderSubsidiaries } from "./components/subsidiaries";
import { renderServices } from "./components/services";
import { renderTeam } from "./components/team";
import { renderFAQ } from "./components/faq";
import { renderFooter } from "./components/footer";
WebGen({ autoLoadFonts: false });
import '../../assets/css/main.css';

View(({ use: draw }) => {
    draw(renderNav())
    draw(renderOpener())
    draw(renderSubsidiaries())
    draw(renderServices())
    draw(renderTeam())
    draw(renderFAQ())
    draw(renderFooter())
})
    .appendOn(document.body)
