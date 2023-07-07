import { Box, Button, Grid, Image, MaterialIcons, PlainText, Vertical, View, WebGen } from "webgen/mod.ts";
import '../../assets/css/main.css';
import { DynaNavigation } from "../../components/nav.ts";
import { RegisterAuthRefresh } from "../manager/helper.ts";
import './landing.css';
import { data, streamingPool } from "./loading.ts";
// Main
import bbnHosting from "./resources/bbnHosting.svg";
import bbnMusic from "./resources/bbnMusic.svg";

// External
import bbnCard from "./resources/bbnCard.svg";
import bbnGameStudios from "./resources/bbnGameStudios.svg";
import bbnPublishing from "./resources/bbnPublishing.svg";

import { Counter } from "../shared/counter.ts";
WebGen({ icon: new MaterialIcons() });
await RegisterAuthRefresh();

View(() => Vertical(
    DynaNavigation("Home"),
    Vertical(
        Box(
            Box().addClass("background-image"),
            PlainText("Your Journey,  our Mission.")
        )
            .addClass("big-title"),
        Box(
            PlainText("BBN One", "h2"),
            PlainText("Your all in one solution. Everything in “One” place.", "h3")
        ).addClass("section"),
        Grid(
            Box(
                Image(bbnMusic, "An orange logo of BBN Music")
            )
                .setAttribute("data-tilt")
                .setAttribute("data-tilt-glare")
                .setAttribute("data-tilt-max-glare", "0.1")
                .setAttribute("data-tilt-scale", "1.07")
                .addClass("music", "service-card")
                .onClick(() => location.href = "/music"),
            Box(
                Image(bbnHosting, "An blue logo of BBN Hosting")
                    .addClass("remove-text-clearance")
            )
                .setAttribute("data-tilt")
                .setAttribute("data-tilt-glare")
                .setAttribute("data-tilt-max-glare", "0.1")
                .setAttribute("data-tilt-scale", "1.08")
                .addClass("hosting", "service-card")
                .onClick(() => location.href = "/hosting")
        )
            .addClass("bbn-one-services")
            .setRawColumns("max-content max-content"),
        Box(
            PlainText("Grown now.", "h2"),
            PlainText("Our BBN One platform is focused on building your projects.", "h3")
        ).addClass("section"),
        Grid(
            Grid(
                Counter(data.stats.$drops)
                    .addClass("title"),
                PlainText("drops")
                    .addClass("subtitle")
            ),
            Grid(
                Counter(data.stats.$servers)
                    .addClass("title"),
                PlainText("servers")
                    .addClass("subtitle")
            ),
            Grid(
                Counter(data.stats.$users)
                    .addClass("title"),
                PlainText("users")
                    .addClass("subtitle")
            ),
        )
            .addClass("live-stats")
            .setRawColumns("auto auto auto"),

        Button("Join and grow these numbers!")
            .asLinkButton("/hosting"),
        Box(
            PlainText("Other things we do", "h2"),
            PlainText("Special goals? We are here for you.", "h3")
        ).addClass("section"),
        Grid(
            Image(bbnCard, "A logo from BBN Card"),
            Image(bbnGameStudios, "A logo from BBN Games Studios"),
            Image(bbnPublishing, "A logo from BBN Publishing"),
        )
            .setGap("4rem")
            .addClass("other-services-images")
            .setRawColumns("max-content max-content max-content")
    ).setAlign("center"),
    // renderFooter()
))
    .appendOn(document.body);


import("https://raw.githubusercontent.com/micku7zu/vanilla-tilt.js/master/dist/vanilla-tilt.min.js");
await streamingPool();