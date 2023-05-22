import { Vertical, View, WebGen } from "webgen/mod.ts";
import '../assets/css/main.css';
import { renderFooter } from "../components/footer.ts";
import { DynaNavigation } from "../components/nav.ts";
import { renderTeam } from "../components/team.ts";
WebGen({});

View(() => Vertical(
    DynaNavigation("Home"),
    renderTeam(),
    renderFooter()
))
    .appendOn(document.body);
