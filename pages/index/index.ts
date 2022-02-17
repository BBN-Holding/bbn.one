import { Custom, View, WebGen } from "../../deps.ts";
import { renderOpener } from "./components/opener.ts";
import { renderSubsidiaries } from "./components/subsidiaries.ts";
import { renderServices } from "./components/services.ts";
import { renderTeam } from "./components/team.ts";
import { renderFAQ } from "./components/faq.ts";
WebGen({ autoLoadFonts: false });
import '../../assets/css/main.css';
import { renderNav } from "../components/nav.ts";
import { renderFooter } from "../components/footer.ts";

View(({ use: draw }) => {
    draw(renderNav())
    draw(Custom(renderOpener()))
    draw(Custom(renderSubsidiaries()))
    draw(Custom(renderServices()))
    draw(Custom(renderTeam()))
    draw(Custom(renderFAQ()))
    draw(renderFooter())
})
    .appendOn(document.body)
