import { activeUser } from "shared/helper.ts";
import { activeRoute, Box, Component, Content, css, Empty, Grid, Label, menuList, PageRouter, PrimaryButton, ref, SecondaryButton } from "webgen/mod.ts";

export function Navigation(actions?: Component) {
    return Box(
        Content(
            Grid(
                Grid(
                    Label(ref`Hi ${activeUser.username} 👋`)
                        .setFontWeight("bold")
                        .setTextSize("4xl"),
                    Grid(
                        menuList
                            .map((item) =>
                                item
                                    .filter((item) => item.weight !== undefined)
                                    .map((item) =>
                                        Box(
                                            activeRoute
                                                .map((activeRoute) => activeRoute == item.route.entry)
                                                .map((active) =>
                                                    (active ? PrimaryButton(item.label) : SecondaryButton(item.label))
                                                        .onPromiseClick(async () => {
                                                            await window.navigation.navigate(item.route.entry.patternUrl).finished;
                                                        })
                                                ),
                                        )
                                    )
                            ),
                    )
                        .setGap(".8rem")
                        .setAutoFlow("column")
                        .setAutoColumn("max-content")
                        .setPadding("7px 0")
                        .setCssStyle("overflow", "auto"),
                )
                    .setGap("1rem")
                    .setMargin("4rem 0 1rem"),
                actions ?? Empty(),
            )
                .setTemplateColumns("auto max-content")
                .setAlignItems("center"),
        )
            .addStyle(css`
                :host {
                    --wg-button-border-radius: var(--wg-radius-large);
                }
            `),
        PageRouter,
    );
}
