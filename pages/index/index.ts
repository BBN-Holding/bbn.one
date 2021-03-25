import { Custom, WebGen } from "@lucsoft/webgen";
import { renderNav } from "./components/nav";
import { renderOpener } from "./components/opener";
import { renderPartner } from "./components/partner";
import { renderServices } from "./components/services";
import { renderTeam } from "./components/team";
import { renderFAQ } from "./components/faq";
import { renderFooter } from "./components/footer";
const render = WebGen({ autoLoadFonts: false }).render;
import '../../assets/css/main.css';

render.toBody({}, {}, () => [
    Custom(renderNav()),
    Custom(renderOpener()),
    Custom(renderPartner()),
    Custom(renderServices(render)),
    Custom(renderTeam(render)),
    Custom(renderFAQ(render)),
    Custom(renderFooter())
])
