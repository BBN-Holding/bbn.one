import { Card, createElement, Custom, Grid, Horizontal, img, MaterialIcons, PlainText, Spacer, Vertical, View, WebGen } from "webgen/mod.ts";
import '../../assets/css/main.css';
import { asset } from "../../assets/img/subsidiaries/index.ts";
import { renderFooter } from "../../components/footer.ts";
import { DynaNavigation } from "../../components/nav.ts";
import services from "../../data/services.json" assert { type: "json" };
import { RegisterAuthRefresh } from "../manager/helper.ts";
import { renderOpener } from "./components/opener.ts";
import './components/subsidiaries.css';

WebGen({ icon: new MaterialIcons() });
await RegisterAuthRefresh();

function inlineSVG(data: string) {
    const ele = createElement("div");
    ele.innerHTML = data;
    return Custom(ele.firstChild! as HTMLElement);
}

View(() => Vertical(
    DynaNavigation("Home"),
    Custom(renderOpener()),
    Horizontal(
        Custom(img(asset.bbnMusic)).onClick(() => location.href = "/music"),
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
    Grid(...services.map(x => Card(
        Vertical(
            inlineSVG(x.svgIcon),
            PlainText(x.title)
                .setFont(1.5, 900),
            PlainText(x.description)
        ).setGap("0.5rem").setPadding("var(--gap)")
    ).addClass("service-box")))
        .addClass("limited-width")
        .setDynamicColumns(7)
        .setGap("var(--gap)"),
    //renderTeam(6)
    //    .setId("team"),
    PlainText("FREQUENTLY ASKED QUESTIONS", "h2")
        .setId("faq"),
    PlainText("Get advice and answers from BBN Holding", "h4")
        .setPadding("0 0 2.7rem"),
    Grid(
        Spacer(),
        [
            { width: 5 },
            Card(Vertical(
                PlainText("How much of the income goes to me?")
                    .setFont(1.5, 900),
                PlainText("BBN Music gives you 97% of the income from your products every month on the 21st. BBN Music is the only company in the whole industry that takes a revenue cut this low!")
            )
                .setGap("0.4rem")
                .setPadding("var(--gap)")
            ),
        ],
        Spacer()
    )
        .setEvenColumns(7)
        .addClass("scoped-size"),
    renderFooter()
))
    .appendOn(document.body);
