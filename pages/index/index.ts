import '@lucsoft/webgen';
import { WebGen } from "@lucsoft/webgen";
import { renderNav } from "./components/nav";
import '../../assets/css/main.css';
import { renderOpener } from "./components/opener";
import { renderPartner } from "./components/partner";
import { renderServices } from "./components/services";
import { renderTeam } from "./components/team";
const web = new WebGen({ autoLoadFonts: false });

web.elements.body({ maxWidth: "69rem" })
    .custom(renderNav())
    .custom(renderOpener())
    .custom(renderPartner())
    .custom(renderServices(web))
    .custom(renderTeam(web))