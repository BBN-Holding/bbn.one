import { Vertical, View, WebGen } from "webgen/mod.ts";
import { DynaNavigation } from "../components/nav.ts";
import { renderTeam } from "../components/team.ts";
import { renderFooter } from "../components/footer.ts";
WebGen({});
import '../assets/css/main.css';

View(() => Vertical(
    DynaNavigation("Home"),
    renderTeam(),
    renderFooter()
))
    .appendOn(document.body);
