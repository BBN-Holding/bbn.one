import "./pages/artists.ts";
import "./pages/draftDrops.ts";
import "./pages/payouts.ts";
import "./pages/publishedDrops.ts";
import "./pages/unpublishedDrops.ts";

/// <reference types="npm:@types/dom-navigation/index.d.ts" />

import { activeUser, RegisterAuthRefresh, renewAccessTokenIfNeeded, sheetStack } from "shared/helper.ts";
import { API, stupidErrorAlert } from "shared/restSpec.ts";
import { activeRoute, appendBody, Box, Content, createRoute, css, DialogContainer, FullWidthSection, Grid, Label, menuList, PageRouter, PrimaryButton, ref, SecondaryButton, StartRouting, WebGenTheme } from "webgen/mod.ts";
import "../../assets/css/main.css";
import "../../assets/css/music.css";
import { DynaNavigation } from "../../components/nav.ts";
import { DropType } from "../../spec/music.ts";
import { draftsDropsPage } from "./pages/draftDrops.ts";
import { publishedDrops } from "./pages/publishedDrops.ts";

await RegisterAuthRefresh();

createRoute({
    path: "/c/music",
    events: {
        onActive: async () => {
            const list = await API.music.drops.list().then(stupidErrorAlert);
            const published = list.filter((x) => x.type === DropType.Published);

            if (published.length >= 1) {
                publishedDrops.route.navigate({});
            } else {
                draftsDropsPage.route.navigate({});
            }
        },
    },
});

export function Navigation() {
    return Box(
        Content(
            Grid(
                Label(ref`Hi ${activeUser.username} 👋`)
                    .setFontWeight("bold")
                    .setTextSize("4xl"),
                Grid(
                    menuList
                        .map((item) =>
                            item
                                .filter((item) => item.route.entry.patternUrl.startsWith("/c/music?list="))
                                .map((item) =>
                                    Box(activeRoute.map((activeRoute) =>
                                        (activeRoute == item.route.entry ? PrimaryButton(item.label) : SecondaryButton(item.label))
                                            .onPromiseClick(async () => {
                                                await window.navigation.navigate(item.route.entry.patternUrl).finished;
                                            })
                                    ))
                                )
                        ),
                )
                    .setGap(".8rem")
                    .setAutoFlow("column")
                    .setAutoColumn("max-content"),
            )
                .setGap("1rem")
                .setMargin("4rem 0 1rem"),
        )
            .addStyle(css`
                :host {
                    --wg-button-border-radius: var(--wg-radius-large);
                }
            `),
        PageRouter,
    );
}

appendBody(
    WebGenTheme(
        DialogContainer(sheetStack.visible(), sheetStack),
        Content(
            FullWidthSection(
                DynaNavigation("Music"),
            ),
        ),
        Navigation(),
    )
        .addStyle(css`
            :host {
                --wg-primary: rgb(255, 171, 82);
                --content-max-width: 1200px;
            }
        `),
);

StartRouting();
renewAccessTokenIfNeeded();
