import { BIcon, Box, Button, ButtonStyle, Grid, IconButton, Image, Label, Vertical, View, WebGen } from "webgen/mod.ts";
import '../../assets/css/main.css';
import { DynaNavigation } from "../../components/nav.ts";
import { RegisterAuthRefresh } from "../manager/helper.ts";
import './footer.css';
import './landing.css';
import { data, streamingPool } from "./loading.ts";
// Main
import bbnHosting from "./resources/bbnHosting.svg";
import bbnMusic from "./resources/bbnMusic.svg";

// External
import { Counter } from "../shared/counter.ts";
import bbnCard from "./resources/bbnCard.svg";
import bbnGameStudios from "./resources/bbnGameStudios.svg";
import bbnPublishing from "./resources/bbnPublishing.svg";
import splash from "./resources/splash.png";
WebGen();
await RegisterAuthRefresh();

View(() => Box(
    ...DynaNavigation("Home"),
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
            Label("Grown now.", "h2"),
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

    Box(
        Image(splash, "Splash Image").addClass("splash-image"),
        Box(
            Box(
                Label("Looks Dope?\nJoin now!").addClass("title"),
                Label("Delivering Excellence. Empowering Businesses and\nIndividuals with Premium Services")
                    .addClass("subtitle")
            ).addClass("text-section"),
            Button("Get started")
                .asLinkButton("/signin")
                .addClass("round-button", "large-button"),
        ).addClass("area-fg"),
        Box(
            Box(
                ...[
                    [ "Company", [
                        [ "About Us", "https://bbn.one" ],
                        [ "FAQs", "https://bbn.one" ],
                        [ "Teams", "https://bbn.one" ],
                        [ "Contact Us", "mailto:support@bbn.one" ],
                    ] ] as const,

                    [ "Product", [
                        [ "Music", "https://bbn.one/music" ],
                        [ "Hosting", "https://bbn.one/hosting" ],
                    ] ] as const,

                    [ "Use Cases", [
                        [ "Newcomers", "https://bbn.one/music" ],
                        [ "Personal", "https://bbn.one/hosting" ],
                        [ "Small Business", "https://bbn.one/hosting" ],
                    ] ] as const,

                    [ "Resources", [
                        [ "Blog", "https://blog.bbn.one/" ],
                        [ "Status Page", "https://status.bbn.one/" ],
                        [ "Open Source", "https://github.com/bbn-holding/" ],
                        [ "Support", "mailto:support@bbn.one" ],
                    ] ] as const,
                ].map(([ text, items ]) => Grid(
                    Label(text)
                        .addClass("title"),
                    ...items.map(([ title, link ]) =>
                        Button(title)
                            .addClass("link")
                            .setStyle(ButtonStyle.Inline)
                            .asLinkButton(link)
                    )
                ).addClass("column")),
            ).addClass("grouped-links"),
            Grid(
                Grid(
                    ...[
                        [ "youtube", "Youtube", "https://twitch.tv/gd_bbn" ],
                        [ "twitch", "Twitch", "https://twitch.tv/gd_bbn" ],
                        [ "twitter", "Twiter", "https://twitter.com/BBN_Holding" ],
                        [ "facebook", "Facebook", "https://twitch.tv/gd_bbn" ],
                        [ "discord", "Discord", "https://discord.gg/dJevjw2fCe" ],
                        [ "instagram", "Instagram", "https://twitch.tv/gd_bbn" ],
                        [ "github", "GitHub", "https://github.com/bbn-holding/" ],
                    ]
                        .map(([ icon, aria, link ]) =>
                            IconButton(BIcon(icon), aria)
                                .addClass("icon")
                                .asLinkButton(link)
                        )
                ).addClass("icons"),
                Button("Join Now")
                    .setStyle(ButtonStyle.Secondary)
                    .asLinkButton("/signin")
                    .addClass("round-button"),
                Button("Contact Us")
                    .asLinkButton("mailto:support@bbn.one")
                    .addClass("round-button")
            )
                .addClass("icon-bar")
        ).addClass("area-bg")
    ).addClass("footer")
))
    .appendOn(document.body);


import("https://raw.githubusercontent.com/micku7zu/vanilla-tilt.js/master/dist/vanilla-tilt.min.js");
await streamingPool();