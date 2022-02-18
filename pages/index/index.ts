import { Custom, Horizontal, img, Spacer, Vertical, View, WebGen } from "../../deps.ts";
import { renderOpener } from "./components/opener.ts";
import { renderServices } from "./components/services.ts";
import { renderTeam } from "../../components/team.ts";
import { renderFAQ } from "./components/faq.ts";
WebGen({ autoLoadFonts: false });
import '../../assets/css/main.css';
import { renderNav } from "../../components/nav.ts";
import { renderFooter } from "../../components/footer.ts";
import { asset } from "../../assets/img/subsidiaries/index.ts";
import '../../assets/css/components/subsidiaries.css';

View(() => Vertical(
    renderNav(),
    Custom(renderOpener()),
    Horizontal(
        Custom(img(asset.bbnMusic)),
        Spacer(),
        Custom(img(asset.bbnHosting)),
        Spacer(),
        Custom(img(asset.bbnPublishing)),
        Spacer(),
        Custom(img(asset.bbnGamesStudio)),
        Spacer(),
        Custom(img(asset.bbnCard))
    ).addClass('subsidiary-list'),
    Custom(renderServices()),
    renderTeam(5),
    Custom(renderFAQ()),
    renderFooter()
))
    .appendOn(document.body)
