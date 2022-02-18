import { Vertical, View, WebGen } from "../../deps.ts";
import { renderNav } from "../../components/nav.ts";
import { renderTeam } from "../../components/team.ts";
import { renderFooter } from "../../components/footer.ts";
WebGen({ autoLoadFonts: false });
import '../../assets/css/main.css';

View(() => Vertical(
    renderNav(),
    renderTeam(100),
    renderFooter()
))
    .appendOn(document.body)
