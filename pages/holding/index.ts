import { Body, Box, Button, Grid, Image, Label, Vertical, WebGen } from "webgen/mod.ts";
import '../../assets/css/main.css';
import { DynaNavigation } from "../../components/nav.ts";
import { RegisterAuthRefresh } from "../_legacy/helper.ts";
import './landing.css';
import { data, streamingPool } from "./loading.ts";
// Main
// @deno-types="https://raw.githubusercontent.com/lucsoft-DevTeam/lucsoft.de/master/custom.d.ts"
import bbnHosting from "./resources/bbnHosting.svg";
// @deno-types="https://raw.githubusercontent.com/lucsoft-DevTeam/lucsoft.de/master/custom.d.ts"
import bbnMusic from "./resources/bbnMusic.svg";

// External
import { Counter } from "shared/counter.ts";
import { Footer } from "shared/footer.ts";
// @deno-types="https://raw.githubusercontent.com/lucsoft-DevTeam/lucsoft.de/master/custom.d.ts"
import bbnCard from "./resources/bbnCard.svg";
// @deno-types="https://raw.githubusercontent.com/lucsoft-DevTeam/lucsoft.de/master/custom.d.ts"
import bbnGameStudios from "./resources/bbnGameStudios.svg";
// @deno-types="https://raw.githubusercontent.com/lucsoft-DevTeam/lucsoft.de/master/custom.d.ts"
import bbnPublishing from "./resources/bbnPublishing.svg";
WebGen();
await RegisterAuthRefresh();

Body(Box(
    DynaNavigation("Home"),
    Vertical(
        Box(
            Box().addClass("background-image"),
            Label("Your Journey,  our Mission.")
        )
            .addClass("big-title"),
        Box(
            Label("BBN One", "h2"),
            Label("Your all in one solution. Everything in “One” place.", "h3")
        ).addClass("section"),
        Box(Box()).addClass("glowbs", "orange"),
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
            Label("Grow now.", "h2"),
            Label("Our BBN One platform is focused on building your projects.", "h3")
        ).addClass("section"),
        Box(Box()).addClass("glowbs", "blue"),
        Grid(
            Grid(
                Counter(data.stats.$drops)
                    .addClass("title"),
                Label("drops")
                    .addClass("subtitle")
            ),
            Grid(
                Counter(data.stats.$servers)
                    .addClass("title"),
                Label("servers")
                    .addClass("subtitle")
            ),
            Grid(
                Counter(data.stats.$users)
                    .addClass("title"),
                Label("users")
                    .addClass("subtitle")
            ),
        )
            .addClass("live-stats")
            .setRawColumns("auto auto auto"),

        Button("Join and grow these numbers!")
            .asLinkButton("/hosting"),
        Box(
            Label("Other things we do", "h2"),
            Label("Special goals? We are here for you.", "h3")
        ).addClass("section"),
        Box(
            Image(bbnCard, "A logo from BBN Card"),
            Image(bbnGameStudios, "A logo from BBN Games Studios"),
            Image(bbnPublishing, "A logo from BBN Publishing"),
        )
            .addClass("other-services-images"),
        Box(Box()).addClass("glowbs", "purple"),
    )
        .addClass("content")
        .setAlign("center"),

    Footer()
));


import("https://raw.githubusercontent.com/micku7zu/vanilla-tilt.js/master/dist/vanilla-tilt.min.js");
await streamingPool();
