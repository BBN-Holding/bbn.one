import { Box, Component, Grid, Label } from "webgen/core/mod.ts";
import { BootstrapIcon, Image, PrimaryButton, SecondaryButton, TextButton } from "webgen/mod.ts";
import { splash } from "../../assets/imports.ts";
import "./footer.css";

export function Footer() {
    return Grid(
        Grid(
            Box(
                Label("Looks Dope?\nJoin now!").addClass("title"),
                Label("Delivering Excellence. Empowering Businesses and\nIndividuals with Premium Services")
                    .addClass("subtitle"),
            ).addClass("text-section"),
            PrimaryButton("Get started")
                .onClick(() => location.href = "/signin")
                .addClass("round-button", "large-button"),
            Image(splash, "Splash Image").setWidth("572px"),
        ).addClass("area-fg"),
        Box(
            Grid(
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

                    // ["Use Cases", [
                    //     ["Newcomers", "/music"],
                    //     ["Personal", "/hosting"],
                    //     ["Small Business", "/hosting"],
                    // ]] as const,

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
            )
                .setDynamicColumns(20)
                .addClass("grouped-links"),
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
                )
                    .setAutoFlow("column")
                    .setAutoColumn("max-content")
                    .addClass("icons"),
                SecondaryButton("Join Now")
                    .onClick(() => location.href = "/signin")
                    .addClass("round-button"),
                PrimaryButton("Contact Us")
                    .onClick(() => location.href = "mailto:support@bbn.one")
                    .addClass("round-button"),
            )
                .setGap()
                .setTemplateColumns("auto max-content max-content")
                .addClass("icon-bar"),
        ).addClass("area-bg"),
    )
        .setAutoFlow("row")
        .setGap();
    // .setMargin("calc(var(--spacing) * 2) auto var(--spacing)")
    // .setMaxWidth("1235px")
    // .setWidth("calc(100vw - 5rem)")
    // .setJustifyItems("start");
}
