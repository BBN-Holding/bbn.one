import { View, WebGen } from "@lucsoft/webgen";
import { renderNav } from "./components/nav";
import { renderTeam } from "./components/team";
import { renderFooter } from "../index/components/footer";
WebGen({ autoLoadFonts: false });
import '../../assets/css/main.css';

View(({ use: draw }) => {
    draw(renderNav())
    draw(renderTeam())
    draw(renderFooter())
})
    .appendOn(document.body)
