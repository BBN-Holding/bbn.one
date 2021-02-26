import '@lucsoft/webgen';
import { SupportedThemes, WebGen } from "@lucsoft/webgen";
import { renderNav } from "./components/nav";
import '../../assets/css/main.css';
import { renderOpener } from "./components/opener";
const web = new WebGen({ autoLoadFonts: false });

web.elements.body({ maxWidth: "69rem" })
    .custom(renderNav())
    .custom(renderOpener())