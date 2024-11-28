import { Footer } from "shared/footer.ts";
import { RegisterAuthRefresh } from "shared/helper.ts";
import { appendBody, Box, Content, FullWidthSection, Grid, Label, WebGenTheme } from "webgen/mod.ts";
import { DynaNavigation } from "../../components/nav.ts";
import "./flowText.css";

await RegisterAuthRefresh();

appendBody(
    WebGenTheme(
        Content(
            FullWidthSection(
                DynaNavigation("Home"),
            ),
            Box(
                Label("Imprint").setTextSize("2xl"),
                Grid(
                    Label("Phone:"),
                    Label("+49 176 16818623"),
                    Label("EMail:"),
                    Label("support@bbn.one"),
                    Label("Internet:"),
                    Label("bbn.one"),
                    Label("Address:"),
                    Label("BBN Music Gmbh\nRosa-Luxemburg-Str. 37\n14482 Potsdam\nGermany"),
                    Label("Commercial register:"),
                    Label("Potsdam Local Court\nHRB 39134 P"),
                    Label("EUID"),
                    Label("DEG1312.HRB39134P"),
                    Label("VAT ID:"),
                    Label("DE370194161"),
                    Label("Managing Directors:"),
                    Label("Maximilian Arzberger\nGregor Bigalke"),
                    Label("Responsible for content:"),
                    Label("Maximilian Arzberger, Gregor Bigalke\nRose-Luxemburg-Str. 37\n14482 Potsdam\nGermany"),
                ).setEvenColumns(2).setGap().setCssStyle("whiteSpace", "pre-wrap"),
                Label(`Alternative dispute resolution`).setTextSize("xl"),
                Label(
                    `The European Commission provides a platform for the out-of-court resolution of disputes (ODR platform), which can be viewed under ec.europa.eu/odr`,
                ).setMargin("0.5rem 0").setCssStyle("display", "block"),
                Label(`We are not willing or obliged to participate in dispute resolution proceedings before a consumer arbitration board.`),
            ).setMargin("5rem auto 0"),
        ).setHeight("100vh"),
        Footer(),
    ),
);
