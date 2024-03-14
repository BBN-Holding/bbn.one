import { Footer } from "shared/footer.ts";
import { Body, Box, Button, Color, Content, FullWidthSection, Grid, Image, Label, MIcon, WebGen } from "webgen/mod.ts";
import { DynaNavigation } from "../../components/nav.ts";
import { RegisterAuthRefresh } from "../_legacy/helper.ts";
import "./main.css";

// @deno-types="https://raw.githubusercontent.com/lucsoft-DevTeam/lucsoft.de/master/custom.d.ts"
import apple from "./assets/apple.svg";
// @deno-types="https://raw.githubusercontent.com/lucsoft-DevTeam/lucsoft.de/master/custom.d.ts"
import deezer from "./assets/deezer.svg";
// @deno-types="https://raw.githubusercontent.com/lucsoft-DevTeam/lucsoft.de/master/custom.d.ts"
import facebook from "./assets/facebook.svg";
// @deno-types="https://raw.githubusercontent.com/lucsoft-DevTeam/lucsoft.de/master/custom.d.ts"
import instagram from "./assets/instagram.svg";
// @deno-types="https://raw.githubusercontent.com/lucsoft-DevTeam/lucsoft.de/master/custom.d.ts"
import pandora from "./assets/pandora.svg";
// @deno-types="https://raw.githubusercontent.com/lucsoft-DevTeam/lucsoft.de/master/custom.d.ts"
import spotify from "./assets/spotify.svg";
// @deno-types="https://raw.githubusercontent.com/lucsoft-DevTeam/lucsoft.de/master/custom.d.ts"
import tidal from "./assets/tidal.svg";
// @deno-types="https://raw.githubusercontent.com/lucsoft-DevTeam/lucsoft.de/master/custom.d.ts"
import tiktok from "./assets/tiktok.svg";
// @deno-types="https://raw.githubusercontent.com/lucsoft-DevTeam/lucsoft.de/master/custom.d.ts"
import youtube from "./assets/youtube.svg";


WebGen();
await RegisterAuthRefresh();

Body(
    Content(
        FullWidthSection(
            DynaNavigation("Home")
        ),
        Grid(
            Box(
                Label("Drop in with\nyour Audience.")
                    .setTextSize("7xl")
                    .setTextAlign("start")
                    .setBalanced()
                    .setFontWeight("black"),
            )
                .setWidth("50%")
                .setMargin("10rem 0 0 0"),
            Box(
                Label("BBN Music, your gateway to unlimited music distribution at a low cost. Maximize your reach without limits. Join us and let the world hear your music.")
                    .setTextSize("xl")
                    .setBalanced()
                    .addClass("line-height-1-2")
                    .setFontWeight("medium"),
            )
                .setWidth("max(15px, 29rem)"),
            Button("Drop your Music")
                .setTextSize("base")
                .addClass("orange-bg", "orange-box-shadow")
                .setFontWeight("bold")
                .setPadding("25px 30px")
                .setBorderRadius("large")
        )
            .setGap("25px")
            .setJustifyItems("start"),
        Content(
            Grid(
                Label("Our pricing plan to disrupt the Market:")
                    .setFontWeight("bold")
                    .setMargin("135px 0 40px 0")
                    .setTextAlign("center")
            ),
            Grid(
                Grid(
                    Label("Free Plan")
                        .setFontWeight("black")
                        .setWidth("max-content")
                        .setPadding("0 5px")
                        .setBorderRadius("tiny")
                        .addClass("badge-free-tier-bg"),
                    Grid(
                        Label("Your Revenue")
                            .setTextSize("lg")
                            .setFontWeight("bold"),
                        Label("97%")
                            .addClass("line-height-0-8", "xl7-5")
                            .setFontWeight("black"),
                    ),
                    Label("No Extra Cost")
                        .setTextSize("3xl")
                        .setFontWeight("bold"),
                    Grid(
                        MIcon("check_circle", "outlined"),
                        Label("Unlimited Drops"),
                        MIcon("check_circle", "outlined"),
                        Label("Unlimited Artists"),
                        MIcon("check_circle", "outlined"),
                        Label("Reach 52 Stores"),
                        MIcon("check_circle", "outlined"),
                        Label("Reach 195 Countries"),
                        MIcon("check_circle", "outlined"),
                        Label("No Payment Needed"),
                    )
                        .addClass("feature-list")
                        .setGap("20px")
                        .setRawColumns("max-content auto"),
                    Button("Drop Now!")
                        .setPadding("25px 30px")
                        .setBorderRadius("large")
                        .addClass("orange-bg", "orange-box-shadow")
                        .setJustifyContent("center")
                        .onClick(() => {
                            console.log("Drop Now!");
                        })
                )
                    .setGap("30px")
                    .setPadding("45px 40px")
                    .addClass("extra-large-br")
                    .addClass("free-tier-bg")
                    .setAlignContent("start"),
                Grid(
                    Label("Paid Plan")
                        .setFontWeight("black")
                        .setWidth("max-content")
                        .setPadding("0 5px")
                        .setBorderRadius("tiny")
                        .addClass("badge-paid-tier-bg"),
                    Grid(
                        Label("Your Revenue")
                            .setTextSize("lg")
                            .setFontWeight("bold"),
                        Label("100%")
                            .addClass("line-height-0-8", "xl7-5")
                            .setFontWeight("black"),
                    ),
                    Label("1€ per Year")
                        .setTextSize("3xl")
                        .setFontWeight("bold"),
                    Grid(
                        MIcon("check_circle", "outlined"),
                        Label("Unlimited Drops"),
                        MIcon("check_circle", "outlined"),
                        Label("Unlimited Artists"),
                        MIcon("check_circle", "outlined"),
                        Label("Reach 52 Stores"),
                        MIcon("check_circle", "outlined"),
                        Label("Reach 195 Countries"),
                        MIcon("check_circle", "outlined"),
                        Label("No Revenue Cut"),
                        MIcon("check_circle", "outlined"),
                        Label("Fully Customizable"),
                        MIcon("check_circle", "outlined"),
                        Label("Priority Queue"),
                        MIcon("check_circle", "outlined"),
                        Label("Priority Support"),
                    )
                        .addClass("feature-list")
                        .setGap("20px")
                        .setAlignItems("center")
                        .setRawColumns("max-content auto"),
                    Button("Coming Soon")
                        .setColor(Color.Disabled)
                        .setPadding("25px 30px")
                        .setBorderRadius("large")
                        .setJustifyContent("center")
                )
                    .setGap("30px")
                    .setPadding("45px 40px")
                    .addClass("extra-large-br")
                    .addClass("paid-tier-bg")
                    .setAlignContent("start"),
            )
                .setGap("35px")
                .setAlignItems("start")
                .setDynamicColumns(2)
        )
            .setMaxWidth("850px"),
        Box(
            Grid(
                Label("Let your fans enjoy your Drops where they feel home.")
                    .setTextSize("xl")
                    .setFontWeight("bold")
                    .setMargin("20px 10px")
                    .setTextAlign("center")
            ),
            // TODO: Make a icon carousel
            Grid(
                Image(apple, "Apple Music"),
                Image(deezer, "Deezer"),
                Image(facebook, "Facebook"),
                Image(instagram, "Instagram"),
                Image(pandora, "Pandora"),
                Image(spotify, "Spotify"),
                Image(tidal, "Tidal"),
                Image(tiktok, "TikTok"),
                Image(youtube, "Youtube"),
                Image(apple, "Apple Music"),
                Image(deezer, "Deezer"),
                Image(facebook, "Facebook"),
                Image(instagram, "Instagram"),
                Image(pandora, "Pandora"),
                Image(spotify, "Spotify"),
                Image(tidal, "Tidal"),
                Image(tiktok, "TikTok"),
                Image(youtube, "Youtube"),
                Image(apple, "Apple Music"),
                Image(deezer, "Deezer"),
                Image(facebook, "Facebook"),
                Image(instagram, "Instagram"),
                Image(pandora, "Pandora"),
                Image(spotify, "Spotify"),
                Image(tidal, "Tidal"),
                Image(tiktok, "TikTok"),
                Image(youtube, "Youtube"),
                Image(apple, "Apple Music"),
                Image(deezer, "Deezer"),
                Image(facebook, "Facebook"),
                Image(instagram, "Instagram"),
                Image(pandora, "Pandora"),
                Image(spotify, "Spotify"),
                Image(tidal, "Tidal"),
                Image(tiktok, "TikTok"),
                Image(youtube, "Youtube"),
            ).addClass("icon-carousel").setGap("20px").setDirection("column")
        ),
        Grid(
            Label("Make it. Drop it.")
                .setFontWeight("bold")
                .setTextSize("6xl")
                .setTextAlign("center"),
            Label("Distributing music should be accessible without any credit card.")
                .setTextAlign("center")
                .setFontWeight("bold")
                .setTextSize("xl")
        )
            .setMargin("100px 0"),
        FullWidthSection(
            Box(
                Box(
                    Label("Why BBN Music"),
                    Button("Drop your Music")
                ),
                Box(
                    MIcon("percent"),
                    Label("Lowest Cut"),
                    Label("With our free plan, we only take a 3% cut as Royalties."),
                ),
                Box(
                    MIcon("public"),
                    Label("Global"),
                    Label("We support multiple distributors, without any extra cost for you.")
                ),
                Box(
                    MIcon("all_inclusive"),
                    Label("Unlimited"),
                    Label("No hard limits. You can manage as many Drops or Artists as you want.")
                )
            )
        ),
        Grid(
            Label("Loved by Artists.")
                .setFontWeight("bold")
                .setTextSize("6xl")
                .setTextAlign("center"),
            Label("See how our Artists value BBN Music.")
                .setTextAlign("center")
                .setFontWeight("bold")
                .setTextSize("xl")
        )
            .setMargin("100px 0"),
        Box(
            Label("The thing I love the most is the flexibility and the contactability of the entire BBN Music team. It is also just great to develop concepts and plans with motivated and very friendly people."),
            Grid(
                Image("https://via.placeholder.com/150", "Avatar of Redz")
                    .setBorderRadius("complete")
                    .resizeToBox(),
                Label("Redz")
            )
                .setRawColumns("40px auto")
                .setAlignItems("center")
                .setGap("16px")
        ),
        Box(
            Label("There is pretty much no other digital distributor that offers more and at the same time, works so closely with artists and who artists are so valued by and feel so understood by."),
            Grid(
                Image("https://via.placeholder.com/150", "Avatar of Criticz")
                    .setBorderRadius("complete")
                    .resizeToBox(),
                Label("Criticz")
            )
                .setRawColumns("40px auto")
                .setAlignItems("center")
                .setGap("16px")
        ),
        FullWidthSection(
            Footer()
        )
    )
        .setMaxWidth("1230px")
);