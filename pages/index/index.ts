import '@lucsoft/webgen';
import { WebGen } from "@lucsoft/webgen";
import { renderNav } from "./components/nav";
import '../../assets/css/main.css';
import { renderOpener } from "./components/opener";
import { renderPartner } from "./components/partner";
const web = new WebGen({ autoLoadFonts: false });

web.elements.body({ maxWidth: "69rem" })
    .custom(renderNav())
    .custom(renderOpener())
    .custom(renderPartner())