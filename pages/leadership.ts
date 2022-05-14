import { Vertical, View, WebGen } from "../deps.ts";
import { DynaNavigation } from "../components/nav.ts";
import { renderTeam } from "../components/team.ts";
import { renderFooter } from "../components/footer.ts";
WebGen({ autoLoadFonts: false });
import '../assets/css/main.css';

View(() => Vertical(
    DynaNavigation("Home"),
    renderTeam(),
    renderFooter()
))
    .appendOn(document.body)
