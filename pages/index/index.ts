import { Card, Custom, Grid, Horizontal, img, modernCard, PlainText, Spacer, Vertical, View, WebGen } from "webgen/mod.ts";
import { renderOpener } from "./components/opener.ts";
import { renderTeam } from "../../components/team.ts";
import '../../assets/css/main.css';
import { DynaNavigation } from "../../components/nav.ts";
import { renderFooter } from "../../components/footer.ts";
import { asset } from "../../assets/img/subsidiaries/index.ts";
import '../../assets/css/components/subsidiaries.css';
import services from "../../data/services.json" assert { type: "json" };

WebGen({ autoLoadFonts: false });

View(() => Vertical(
    DynaNavigation("Home"),
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
    PlainText("SERVICES", "h2")
        .setId("services"),
    PlainText("We offer our partners and customers a wide range of services.", "h4")
        .setPadding("0 0 2.7rem"),
    Grid(...services.map(x => Card(modernCard({
        icon: {
            svg: x.svgIcon
        },
        title: x.title,
        align: x.align as "down" | "right" | "left",
        description: PlainText(x.description)
    }))))
        .addClass("limited-width")
        .setDynamicColumns(7)
        .setGap("var(--gap)"),
    renderTeam(6)
        .setId("team"),
    PlainText("FREQUENTLY ASKED QUESTIONS", "h2")
        .setId("faq"),
    PlainText("Get advice and answers from BBN Holding", "h4")
        .setPadding("0 0 2.7rem"),
    Grid(
        Spacer(),
        [
            { width: 5 },
            Card(modernCard({
                title: "How much of the income goes to me?",
                description: PlainText("BBN Music gives you 97% of the income from your products every month on the 21st. BBN Music is the only company in the whole industry that takes a revenue cut this low!")
            })),
        ],
        Spacer()
    )
        .setEvenColumns(7)
        .addClass("scoped-size"),
    renderFooter()
))
    .appendOn(document.body);
