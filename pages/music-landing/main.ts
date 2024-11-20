import { Footer } from "shared/footer.ts";
import { RegisterAuthRefresh } from "shared/helper.ts";
import { Image, MaterialIcon, mediaQueryRef, PrimaryButton, SheetHeader, Sheets, WebGenTheme } from "webgen/components/mod.ts";
import { Box, Content, Empty, FullWidthSection, Grid, Label } from "webgen/core/mod.ts";
import { appendBody } from "webgen/mod.ts";
import { DynaNavigation } from "../../components/nav.ts";
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

import criticz from "./assets/criticz.jpg";
import redz from "./assets/redz.jpg";

await RegisterAuthRefresh();

const images = () =>
    Array.from({ length: 4 }, () => [
        Image(apple, "Apple Music"),
        Image(deezer, "Deezer"),
        Image(facebook, "Facebook"),
        Image(instagram, "Instagram"),
        Image(pandora, "Pandora"),
        Image(spotify, "Spotify"),
        Image(tidal, "Tidal"),
        Image(tiktok, "TikTok"),
        Image(youtube, "Youtube"),
    ]).flat();

export const isMobileKeyFeatures = mediaQueryRef("(max-width: 820px)");

const sheets = Sheets();

sheets.addSheet(Grid(SheetHeader("dsf", sheets), Label("sadfds")));

appendBody(
    WebGenTheme(
        Content(
            FullWidthSection(
                DynaNavigation("Music"),
            ),
            FullWidthSection(Empty().addClass("background-image")),
            Content(
                Grid(
                    Box(
                        Label("Drop in with\nyour Audience")
                            .setTextSize("7xl")
                            .setAlignSelf("start")
                            .setCssStyle("textAlign", "start")
                            .setCssStyle("textWrap", "balance")
                            .setFontWeight("black"),
                    )
                        .addClass("max-width-30rem")
                        .setWidth("100%")
                        .setMargin("10rem 0 0 0"),
                    Box(
                        Label("BBN Music, your gateway to unlimited music distribution at a low cost. Maximize your reach without limits. Join us and let the world hear your music.")
                            .setTextSize("xl")
                            .setCssStyle("textWrap", "balance")
                            .addClass("line-height-1-2")
                            .setFontWeight("medium"),
                    )
                        .addClass("max-width-30rem"),
                    PrimaryButton("Drop your Music")
                        .onClick(() => location.href = "/c/music")
                        .setPadding("12px 30px")
                        .setFontWeight("bold")
                        .setTextSize("lg")
                        .addClass("orange-bg", "orange-box-shadow")
                        .setCssStyle("borderRadius", "0.8rem"),
                )
                    .setGap("25px")
                    .setJustifyItems("start"),
            )
                .setMaxWidth("900px"),
            Content(
                Grid(
                    Label("Our pricing plan to disrupt the Market:")
                        .setFontWeight("bold")
                        .setMargin("135px 0 40px 0")
                        .setCssStyle("textAlign", "center")
                        .addClass("opacity-60"),
                ),
                Grid(
                    Grid(
                        Label("Free Plan")
                            .setFontWeight("black")
                            .setWidth("max-content")
                            .setPadding("0 5px")
                            .setCssStyle("borderRadius", "0.3rem")
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
                            .setFontWeight("bold")
                            .addClass("opacity-60"),
                        Grid(
                            MaterialIcon("check_circle"),
                            Label("Unlimited Drops"),
                            MaterialIcon("check_circle"),
                            Label("Unlimited Artists"),
                            MaterialIcon("check_circle"),
                            Label("Reach 52 Stores"),
                            MaterialIcon("check_circle"),
                            Label("Reach 195 Countries"),
                            MaterialIcon("check_circle"),
                            Label("No Payment Needed"),
                        )
                            .setGap("20px")
                            .setTemplateColumns("max-content auto")
                            .addClass("feature-list"),
                        PrimaryButton("Drop Now!")
                            .onClick(() => location.href = "/c/music")
                            .setPadding("12px 30px")
                            .setFontWeight("bold")
                            .setTextSize("lg")
                            .setCssStyle("borderRadius", "0.8rem")
                            .addClass("orange-bg", "orange-box-shadow")
                            .setJustifyContent("center"),
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
                            .setCssStyle("borderRadius", "0.3rem")
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
                            .setFontWeight("bold")
                            .addClass("opacity-60"),
                        Grid(
                            MaterialIcon("check_circle"),
                            Label("Unlimited Drops"),
                            MaterialIcon("check_circle"),
                            Label("Unlimited Artists"),
                            MaterialIcon("check_circle"),
                            Label("Reach 52 Stores"),
                            MaterialIcon("check_circle"),
                            Label("Reach 195 Countries"),
                            MaterialIcon("check_circle"),
                            Label("No Revenue Cut"),
                            MaterialIcon("check_circle"),
                            Label("Fully Customizable"),
                            MaterialIcon("check_circle"),
                            Label("Priority Queue"),
                            MaterialIcon("check_circle"),
                            Label("Priority Support"),
                        )
                            .setGap("20px")
                            .setTemplateColumns("max-content auto")
                            .setAlignItems("center")
                            .addClass("feature-list"),
                        PrimaryButton("Coming Soon")
                            .setDisabled(true)
                            .setPadding("25px 30px")
                            .setCssStyle("borderRadius", "0.8rem")
                            .setJustifyContent("center"),
                    )
                        .setGap("30px")
                        .setPadding("45px 40px")
                        .addClass("extra-large-br")
                        .addClass("paid-tier-bg")
                        .setAlignContent("start"),
                )
                    .setGap("35px")
                    .setDynamicColumns(15)
                    .setAlignItems("start"),
            )
                .setMaxWidth("900px"),
            Content(
                Grid(
                    Label("Let your fans enjoy your Drops where they feel home.")
                        .setTextSize("xl")
                        .setFontWeight("bold")
                        .setMargin("20px 10px")
                        .setCssStyle("textAlign", "center")
                        .addClass("opacity-60"),
                )
                    .setMargin("10px 0 40px"),
                // Grid(
                //     Grid(images())
                //         .setGap("38px")
                //         .addClass("icon-carousel")
                //         .setDirection("column"),
                //     Grid(...images().reverse())
                //         .setGap("38px")
                //         .addClass("icon-carousel")
                //         .addClass("icon-carousel-reversed")
                //         .setDirection("column"),
                // )
                //     .setGap("35px")
                //     .addClass("icon-carousel-container"),
            )
                .setAlignContent("center")
                .setHeight("380px")
                .setMaxWidth("850px"),
            Grid(
                Label("Make it. Drop it.")
                    .setFontWeight("bold")
                    .setTextSize("6xl")
                    .setCssStyle("textAlign", "center"),
                Label("Distributing music should be accessible without any credit card.")
                    .setCssStyle("textAlign", "center")
                    .setFontWeight("bold")
                    .setTextSize("xl")
                    .addClass("opacity-60"),
            )
                .setMargin("100px 0"),
            FullWidthSection(
                Content(
                    Grid(
                        Grid(
                            Label("Why BBN\xa0Music?")
                                .setTextSize("3xl")
                                .setFontWeight("bold"),
                            isMobileKeyFeatures.map((mobile) =>
                                mobile ? Empty() : PrimaryButton("Drop your Music")
                                    .onClick(() => location.href = "/c/music")
                                    .setCssStyle("borderRadius", "100rem")
                                    .setPadding("2px 25px")
                                    .addClass("orange-bg")
                            ).value,
                        )
                            .setGap()
                            .addClass("title")
                            .setAlignContent("space-between" as "stretch")
                            .setJustifyItems("start"),
                        Grid(
                            MaterialIcon("percent")
                                .addClass("key-icon", "red"),
                            Label("Lowest Cut")
                                .setFontWeight("bold"),
                            Label("With our free plan, we only take a 3% cut of your revenue."),
                        )
                            .setGap("13px")
                            .setJustifyItems("start")
                            .setAlignContent("start"),
                        Grid(
                            MaterialIcon("public")
                                .addClass("key-icon", "green"),
                            Label("Global")
                                .setFontWeight("bold"),
                            Label("We support all major and many smaller stores, without any extra cost for you."),
                        )
                            .setGap("13px")
                            .setJustifyItems("start")
                            .setAlignContent("start"),
                        Grid(
                            MaterialIcon("all_inclusive")
                                .addClass("key-icon", "blue"),
                            Label("Unlimited")
                                .setFontWeight("bold"),
                            Label("No hard limits. You can manage as many Drops and Artists as you want."),
                        )
                            .setGap("13px")
                            .setJustifyItems("start")
                            .setAlignContent("start"),
                        isMobileKeyFeatures.map((mobile) =>
                            mobile
                                ? Box(
                                    PrimaryButton("Drop your Music")
                                        .setCssStyle("borderRadius", "100rem")
                                        .onClick(() => location.href = "/c/music")
                                        .setPadding("2px 25px")
                                        .addClass("orange-bg"),
                                ).addClass("call-to-action")
                                : Empty()
                        ).value,
                    )
                        .setGap()
                        .setDynamicColumns(10)
                        .setPadding("50px 40px")
                        .setCssStyle("borderRadius", "0.8rem")
                        .addClass("free-tier-bg", "key-features"),
                )
                    .setMaxWidth("900px"),
            ),
            Grid(
                Label("Loved by Artists")
                    .setFontWeight("bold")
                    .setTextSize("6xl")
                    .setCssStyle("textAlign", "center"),
                Label("See how our Artists value BBN Music")
                    .setCssStyle("textAlign", "center")
                    .setFontWeight("bold")
                    .setTextSize("xl")
                    .addClass("opacity-60"),
            )
                .setMargin("100px 0"),
            Content(
                Grid(
                    Label("The thing I love the most is the flexibility and the contactability of the entire BBN Music team. It is also just great to develop concepts and plans with motivated and very friendly people.")
                        .setCssStyle("textAlign", "start")
                        .addClass("italic-text")
                        .setFontWeight("bold"),
                    Grid(
                        Image(redz, "Avatar of Redz"),
                        // .setBorderRadius("complete")
                        // .setAspectRatio("1/1")
                        // .resizeToBox(),
                        Label("Redz")
                            .setFontWeight("bold")
                            .setTextSize("xl"),
                    )
                        .setTemplateColumns("40px auto")
                        .setGap("16px")
                        .setAlignItems("center"),
                )
                    .setGap("21px")
                    .addClass("max-width-30rem")
                    .setPadding("95px 0 95px 0"),
                Grid(
                    Label("There is pretty much no other digital distributor that offers more and at the same time, works so closely with artists and who artists are so valued by and feel so understood by.")
                        .setCssStyle("textAlign", "end")
                        .addClass("italic-text")
                        .setFontWeight("bold"),
                    Grid(
                        Image(criticz, "Avatar of Criticz"),
                        // .setBorderRadius("complete")
                        // .setAspectRatio("1/1")
                        // .resizeToBox(),
                        Label("Criticz")
                            .setFontWeight("bold")
                            .setTextSize("xl"),
                    )
                        .setGap("16px")
                        .setTemplateColumns("40px auto")
                        .setAlignItems("center"),
                )
                    .setGap("21px")
                    .setJustifyItems("end")
                    .addClass("max-width-30rem")
                    .setMargin("0 0 0 auto")
                    .setPadding("95px 0 95px 0"),
            ).setMaxWidth("680px"),
            FullWidthSection(Footer()),
        )
            .setMaxWidth("1230px"),
    ),
);
