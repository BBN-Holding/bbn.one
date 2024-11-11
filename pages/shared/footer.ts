import { Box, Component, Grid, Label } from "webgen/core/mod.ts";
// import { splash } from "../../assets/imports.ts";
import { BootstrapIcon, PrimaryButton, SecondaryButton, TextButton } from "webgen/mod.ts";
import "./footer.css";

export function Footer() {
    return Box(
        Box(
            // Image(splash, "Splash Image").addClass("splash-image"),
            Box(
                Box(
                    Label("Looks Dope?\nJoin now!").addClass("title"),
                    Label("Delivering Excellence. Empowering Businesses and\nIndividuals with Premium Services")
                        .addClass("subtitle"),
                ).addClass("text-section"),
                PrimaryButton("Get started")
                    .onClick(() => location.href = "/signin")
                    .addClass("round-button", "large-button"),
            ).addClass("area-fg"),
            Box(
                Box(
                    ...[
                        ["Company", [
                            ["About Us", "/"],
                            ["Terms and Conditions", "/p/terms"],
                            ["Privacy Policy", "/p/privacy-policy"],
                            ["Imprint", "/p/imprint"],
                        ]] as const,

                        ["Products", [
                            ["Music", "/music"],
                            ["Hosting", "/hosting"],
                        ]] as const,

                        ["Use Cases", [
                            ["Newcomers", "/music"],
                            ["Personal", "/hosting"],
                            ["Small Business", "/hosting"],
                        ]] as const,

                        ["Resources", [
                            ["Status Page", "https://status.bbn.one/"],
                            ["Support", "mailto:support@bbn.one"],
                        ]] as const,
                    ].map(([text, items]) =>
                        Grid(
                            Label(text)
                                .addClass("title"),
                            ...items.map(([title, link]) =>
                                TextButton(title)
                                    .onClick(() => location.href = link)
                                    .addClass("link")
                                // .setStyle(ButtonStyle.Inline)
                            ),
                        ).addClass("column")
                    ) as unknown as [Component],
                ).addClass("grouped-links"),
                Grid(
                    Grid(
                        ...[
                            // ["youtube", "Youtube", "https://www.youtube.com/@bbn6775"],
                            // ["twitter", "Twiter", "https://twitter.com/BBN_Holding"],
                            // ["facebook", "Facebook", "https://www.facebook.com/bbn.holding/"],
                            ["discord", "Discord", "https://discord.gg/dJevjw2fCe"],
                            ["instagram", "Instagram", "https://www.instagram.com/bbn.music/"],
                            ["mastodon", "Mastodon", "https://chaos.social/@bbn"],
                            // ["github", "GitHub", "https://github.com/bbn-holding/"],
                        ]
                            .map(([icon, aria, link]) =>
                                TextButton("").addPrefix(BootstrapIcon(icon))
                                    .onClick(() => location.href = link)
                                    .addClass("icon")
                            ) as unknown as [Component],
                    ).addClass("icons"),
                    SecondaryButton("Join Now")
                        .onClick(() => location.href = "/signin")
                        .addClass("round-button"),
                    PrimaryButton("Contact Us")
                        .onClick(() => location.href = "mailto:support@bbn.one")
                        .addClass("round-button"),
                )
                    .addClass("icon-bar"),
            ).addClass("area-bg"),
        ).addClass("footer"),
    ).addClass("footer-space");
}
