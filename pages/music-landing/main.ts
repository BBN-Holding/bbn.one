import { Footer } from "shared/footer.ts";
import { RegisterAuthRefresh } from "shared/helper.ts";
import { Image, MaterialIcon, mediaQueryRef, PrimaryButton, WebGenTheme } from "webgen/components/mod.ts";
import { Box, Content, Empty, FullWidthSection, Grid, Label } from "webgen/core/mod.ts";
import { appendBody, asRef, Color, Component, css } from "webgen/mod.ts";
import { DynaNavigation } from "../../components/nav.ts";

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

import backgroundImage from "./assets/background.png";
import criticz from "./assets/criticz.jpg";
import redz from "./assets/redz.jpg";

await RegisterAuthRefresh();

const images = () =>
    Array.from({ length: 4 }, (): Component[] => [
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

document.adoptedStyleSheets.push(css`
    body {
        --box-shadow-cta: 0 .824px 1.752px #db572124, 0 2.085px 4.43px #db572133, 0 4.253px 9.038px #db57213d, 0 8.76px 18.616px #db57214d, 0 24px 51px #db572170;
        --box-shadow-cta-hover: 0 1.237px .69px #db572145, 0 3.127px 5.113px #db572157, 0 6.38px 15.547px #db57215c, 0 13.141px 37.63px #db572163, 0 36px 100px #db572182;;
        --background-cta: linear-gradient(139deg, #e39123 6.59%, #db5721 101.73%);

        --background-free-tier: linear-gradient(139deg, #e3912333 6.59%, #db572133 101.73%), #0a0a0a;
        --badge-free-tier: linear-gradient(139deg,#d9881c73 6.59%,#c6451073 101.73%);
        --background-paid-tier: linear-gradient(139deg, #d9881c 6.59%, #c64510 101.73%);
        --badge-paid-tier: #00000040;
        --bg-color: ${Color.reverseNeutral.mix(new Color("black"), 50)};
        background-color: var(--bg-color);
    }
`);

const grayText = Color.white.mix(Color.black, 40).toString();

export function CTAButton(label: string) {
    return PrimaryButton(label)
        .addStyle(css`
            button {
                padding: 13px 25px;
                height: 60px;
                border-radius: 0.8rem;
                font-size: 1.01rem;
                font-weight: bold;
                color: white;
                box-shadow: var(--box-shadow-cta);
                background: var(--background-cta);
            }
            button:not(:disabled):hover {
                outline: none;
                box-shadow: var(--box-shadow-cta-hover);
            }
        `);
}

export function CTAButtonSmall() {
    return PrimaryButton("Drop your Music")
        .onClick(() => location.href = "/c/music")
        .addStyle(css`
            :host {
                --wg-button-border-radius: var(--wg-radius-complete);
            }
            button {
                background: var(--background-cta);
                padding: 0 15px;
                color: white;
                height: 40px;
            }
        `);
}

const isLightMode = mediaQueryRef("(prefers-color-scheme: light)");

appendBody(
    WebGenTheme(
        Content(
            FullWidthSection(
                DynaNavigation("Music-Landing"),
            ),
            FullWidthSection(
                Empty()
                    .setAttribute("theme", isLightMode.map((x) => x ? "light" : "dark"))
                    .addStyle(css`
                        :host {
                            position: absolute;
                            display: block;
                            inset: -0.5rem;
                            --image: url('${backgroundImage}');
                            background:
                                linear-gradient(180deg, rgba(0, 0, 0, 0.61) 0%, var(--bg-color) 77.08%, var(--bg-color) 100%),
                                var(--image) no-repeat center center;
                            background-size: cover;
                            filter: blur(4.5px);
                            z-index: -1;
                        }
                        :host([theme=light]) {
                            background:
                                linear-gradient(180deg, rgba(255, 255, 255, 0.61) 0%, #f3f5fa 77.08%, #f3f5fa 100%),
                                var(--image) no-repeat center center;
                            background-size: cover;
                        }
                    `),
            ),
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
                        .setMaxWidth("32rem")
                        .setWidth("100%")
                        .setMargin("10rem 0 0 0"),
                    Box(
                        Label("BBN Music, your gateway to unlimited music distribution at a low cost. Maximize your reach without limits. Join us and let the world hear your music.")
                            .setTextSize("xl")
                            .setCssStyle("textWrap", "balance")
                            .setCssStyle("lineHeight", "1.2")
                            .setFontWeight("medium"),
                    )
                        .setMaxWidth("32rem"),
                    CTAButton("Drop your Music")
                        .onClick(() => location.href = "/c/music"),
                )
                    .setGap("25px")
                    .setJustifyItems("start"),
            )
                .setContentMaxWidth("900px"),
            Content(
                Grid(
                    Label("Our pricing plan to disrupt the Market:")
                        .setFontWeight("bold")
                        .setTextSize("sm")
                        .setCssStyle("color", grayText)
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
                            .setCssStyle("background", "var(--badge-free-tier)"),
                        Grid(
                            Label("Your Revenue")
                                .setTextSize("lg")
                                .setFontWeight("bold"),
                            Label("97%")
                                .setTextSize("7xl")
                                .setFontWeight("black"),
                        ),
                        Label("No Extra Cost")
                            .setTextSize("3xl")
                            .setFontWeight("bold")
                            .setCssStyle("opacity", "60%"),
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
                            .setGap("15px")
                            .setTemplateColumns("max-content auto")
                            .setTextSize("2xl")
                            .setFontWeight("bold")
                            .setAlignItems("center"),
                        CTAButton("Drop Now!")
                            .onClick(() => location.href = "/c/music")
                            .setJustifyContent("center"),
                    )
                        .setGap("30px")
                        .setPadding("45px 40px")
                        .setAlignContent("start")
                        .setRadius("extra")
                        .setCssStyle("overflow", "hidden")
                        .setCssStyle("background", "var(--background-free-tier)"),
                    Grid(
                        Label("Paid Plan")
                            .setFontWeight("black")
                            .setWidth("max-content")
                            .setPadding("0 5px")
                            .setCssStyle("borderRadius", "0.3rem")
                            .setCssStyle("background", "var(--badge-paid-tier)"),
                        Grid(
                            Label("Your Revenue")
                                .setTextSize("lg")
                                .setFontWeight("bold"),
                            Label("100%")
                                .setTextSize("7xl")
                                .setFontWeight("black"),
                        ),
                        Label("1€ per Year")
                            .setTextSize("3xl")
                            .setFontWeight("bold")
                            .setCssStyle("opacity", "60%"),
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
                            .setGap("15px")
                            .setTemplateColumns("max-content auto")
                            .setTextSize("2xl")
                            .setFontWeight("bold")
                            .setAlignItems("center"),
                        PrimaryButton("Coming Soon")
                            .setDisabled(true)
                            .addStyle(css`
                                button {
                                    padding: 13px 25px;
                                    height: 50px;
                                    border-radius: 0.8rem;
                                }
                            `),
                    )
                        .setGap("30px")
                        .setPadding("45px 40px")
                        .setRadius("extra")
                        .setCssStyle("overflow", "hidden")
                        .setCssStyle("background", "var(--background-paid-tier)"),
                )
                    .setGap("35px")
                    .setDynamicColumns(15)
                    .setAlignItems("start"),
            )
                .setContentMaxWidth("900px")
                .setCssStyle("color", "#ffffff"),
            Content(
                Grid(
                    Label("Let your fans enjoy your Drops where they feel home.")
                        .setTextSize("lg")
                        .setFontWeight("bold")
                        .setMargin("20px 10px")
                        .setCssStyle("textAlign", "center")
                        .setCssStyle("color", grayText),
                )
                    .setMargin("10px 0 40px"),
                Grid(
                    Grid(asRef(images()))
                        .setAutoFlow("column")
                        .setGap("38px")
                        .addClass("icon-carousel"),
                    Grid(asRef(images().reverse()))
                        .setAutoFlow("column")
                        .setGap("38px")
                        .addClass("icon-carousel")
                        .addClass("icon-carousel-reversed"),
                )
                    .setGap("35px")
                    .addClass("icon-carousel-container"),
            )
                .setContentMaxWidth("850px")
                .setAlignContent("center")
                .setAttribute("theme", isLightMode.map((x) => x ? "light" : "dark"))
                .addStyle(css`
                    .icon-carousel wg-image {
                        width: var(--carousel-size);
                            height: var(--carousel-size);
                            filter: brightness(0) invert(1);
                    }
                    :host([theme="light"]) .icon-carousel wg-image {
                        filter: brightness(0) invert(0);
                    }
                    @keyframes carousel {
                        0% {
                            /* calc (width + gap) * number of icons * -1 */
                            transform: translateX(calc((var(--carousel-size) + 38px) * -8));
                        }

                        100% {
                            /* calc (width + gap) * (number of icons-0.5) * 2 * -1 */
                            transform: translateX(calc(((var(--carousel-size) + 38px) * -8.5*2)));
                        }
                    }
                    .icon-carousel {
                        --carousel-size: 72px;
                        animation: 30s infinite linear carousel;
                    }
                    .icon-carousel-reversed {
                        animation-direction: reverse;
                    }

                    .icon-carousel-container {
                        mask-image: linear-gradient(90deg, rgba(255, 255, 255, 0.00) 0%, #FFF 50%, rgba(255, 255, 255, 0.00) 100%);
                        overflow: hidden;
                    }
                `)
                .setHeight("380px"),
            Grid(
                Label("Make it. Drop it.")
                    .setFontWeight("bold")
                    .setTextSize("6xl")
                    .setCssStyle("textAlign", "center"),
                Label("Distributing music should be accessible without any credit card.")
                    .setCssStyle("textAlign", "center")
                    .setFontWeight("bold")
                    .setCssStyle("color", grayText)
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
                            Box(isMobileKeyFeatures.map((mobile) => mobile ? [] : CTAButtonSmall())),
                        )
                            .setGap()
                            .addClass("title")
                            .setAlignContent("space-between" as "stretch")
                            .setJustifyItems("start"),
                        Grid(
                            MaterialIcon("percent")
                                .addClass("key-icon", "red")
                                .addStyle(css`
                                    :host {
                                        border-radius: var(--wg-radius-large);
                                        background-color: #EF5C52;
                                        aspect-ratio: 1 / 1;
                                        padding: 10px;
                                    }
                                `),
                            Label("Lowest Cut")
                                .setFontWeight("bold"),
                            Label("With our free plan, we only take a 3% cut of your revenue."),
                        )
                            .setGap("13px")
                            .setJustifyItems("start")
                            .setAlignContent("start"),
                        Grid(
                            MaterialIcon("public")
                                .addStyle(css`
                                    :host {
                                        border-radius: var(--wg-radius-large);
                                        color: #1B1B1B;
                                        background-color: #97EF52;
                                        aspect-ratio: 1 / 1;
                                        padding: 10px;
                                    }
                                `),
                            Label("Global")
                                .setFontWeight("bold"),
                            Label("We support all major and many smaller stores, without any extra cost for you."),
                        )
                            .setGap("13px")
                            .setJustifyItems("start")
                            .setAlignContent("start"),
                        Grid(
                            MaterialIcon("all_inclusive")
                                .addStyle(css`
                                    :host {
                                        border-radius: var(--wg-radius-large);
                                        background-color: #5552EF;
                                        aspect-ratio: 1 / 1;
                                        padding: 10px;
                                    }
                                `),
                            Label("Unlimited")
                                .setFontWeight("bold"),
                            Label("No hard limits. You can manage as many Drops and Artists as you want."),
                        )
                            .setGap("13px")
                            .setJustifyItems("start")
                            .setAlignContent("start"),
                        Box(isMobileKeyFeatures.map((mobile) =>
                            mobile
                                ? CTAButtonSmall()
                                    .addStyle(css`
                                        :host {
                                            margin-top: 2rem;
                                            grid-column: 1 / -1;
                                            justify-self: center;
                                        }
                                    `)
                                : []
                        )).setCssStyle("display", "contents"),
                    )
                        .setGap("1rem")
                        .setDynamicColumns(10)
                        .setPadding("50px 40px")
                        .setCssStyle("borderRadius", "0.8rem")
                        .setCssStyle("background", "var(--background-free-tier)")
                        .setCssStyle("color", "#ffffff"),
                )
                    .setContentMaxWidth("900px"),
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
                    .setCssStyle("color", grayText)
                    .addClass("opacity-60"),
            )
                .setMargin("100px 0"),
            Content(
                Grid(
                    Label("The thing I love the most is the flexibility and the contactability of the entire BBN Music team. It is also just great to develop concepts and plans with motivated and very friendly people.")
                        .setCssStyle("textAlign", "start")
                        .setCssStyle("fontStyle", "italic")
                        .setFontWeight("bold"),
                    Grid(
                        Image(redz, "Avatar of Redz")
                            .setCssStyle("aspectRatio", "1/1")
                            .setRadius("complete"),
                        Label("Redz")
                            .setFontWeight("bold")
                            .setTextSize("xl"),
                    )
                        .setTemplateColumns("40px auto")
                        .setGap("16px")
                        .setAlignItems("center"),
                )
                    .setGap("21px")
                    .setMaxWidth("30rem")
                    .setPadding("95px 0 95px 0"),
                Grid(
                    Label("There is pretty much no other digital distributor that offers more and at the same time, works so closely with artists and who artists are so valued by and feel so understood by.")
                        .setCssStyle("textAlign", "end")
                        .setCssStyle("fontStyle", "italic")
                        .setFontWeight("bold"),
                    Grid(
                        Image(criticz, "Avatar of Criticz")
                            .setCssStyle("aspectRatio", "1/1")
                            .setRadius("complete"),
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
                    .setMaxWidth("30rem")
                    .setMargin("0 0 0 auto")
                    .setPadding("95px 0 95px 0"),
            )
                .setContentMaxWidth("680px"),
            FullWidthSection(Footer()),
        )
            .setContentMaxWidth("1230px"),
    )
        .setPrimaryColor(new Color("#eb8c2d")),
);
