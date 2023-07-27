import { BIcon, Box, Button, ButtonStyle, Grid, IconButton, Image, Label } from "webgen/mod.ts";
import splash from "../../assets/splash.png";
import './footer.css';

export function Footer() {
    return Box(
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
                        [ "About Us", "/p/imprint" ],
                        [ "FAQs", "https://bbn.one" ],
                        [ "Terms of Use", "/p/terms-of-use" ],
                        [ "Privacy Policy", "/p/privacy-policy" ],
                        [ "Contact Us", "mailto:support@bbn.one" ],
                        [ "Distribution Agreement", "/p/distribution-agreement" ],
                    ] ] as const,

                    [ "Products", [
                        [ "Music", "/music" ],
                        [ "Hosting", "/hosting" ],
                    ] ] as const,

                    [ "Use Cases", [
                        [ "Newcomers", "/music" ],
                        [ "Personal", "/hosting" ],
                        [ "Small Business", "/hosting" ],
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
                        [ "youtube", "Youtube", "https://www.youtube.com/@bbn6775" ],
                        [ "twitch", "Twitch", "https://twitch.tv/gd_bbn" ],
                        [ "twitter", "Twiter", "https://twitter.com/BBN_Holding" ],
                        [ "facebook", "Facebook", "https://www.facebook.com/bbn.holding/" ],
                        [ "discord", "Discord", "https://discord.gg/dJevjw2fCe" ],
                        [ "instagram", "Instagram", "https://www.instagram.com/bbn.music/" ],
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
    ).addClass("footer");
}