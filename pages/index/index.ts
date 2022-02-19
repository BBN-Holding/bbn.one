import { Card, Custom, Grid, Horizontal, img, modernCard, PlainText, Spacer, Vertical, View, WebGen } from "../../deps.ts";
import { renderOpener } from "./components/opener.ts";
import { renderTeam } from "../../components/team.ts";
import '../../assets/css/main.css';
import { renderNav } from "../../components/nav.ts";
import { renderFooter } from "../../components/footer.ts";
import { asset } from "../../assets/img/subsidiaries/index.ts";
import '../../assets/css/components/subsidiaries.css';
import services from "../../data/services.json" assert { type: "json" };

WebGen({ autoLoadFonts: false });

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
    PlainText("SERVICES", "h2"),
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
        .addClass("services")
        .setEvenColumns(1, "repeat(auto-fit,minmax(6rem,1fr))")
        .setGap("var(--gap)"),
    renderTeam(6),
    PlainText("FREQUENTLY ASKED QUESTIONS", "h2"),
    PlainText("Get advice and answers from BBN Holding", "h4")
        .setPadding("0 0 2.7rem"),
    Grid(
        Spacer(),
        [
            { width: 5 },
            Card(modernCard({
                title: "How much of the income goes to me?",
                description: PlainText("BBN Music gives you 100% of the income from your products every month on the 21st. BBN Music is the only company in the whole industry that does not take a revenue cut.")
            })),
        ],
        Spacer()
    )
        .setEvenColumns(7)
        .addClass("scoped-size"),
    renderFooter()
))
    .appendOn(document.body)
