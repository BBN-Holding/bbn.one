import { Custom, View, WebGen } from "../../deps.ts";
import { renderNav } from "../components/nav.ts";
import { renderTeam } from "./components/team.ts";
import { renderFooter } from "../components/footer.ts";
WebGen({ autoLoadFonts: false });
import '../../assets/css/main.css';

View(({ use: draw }) => {
    draw(renderNav())
    draw(Custom(renderTeam()))
    draw(renderFooter())
})
    .appendOn(document.body)
