import "./pages/artists.ts";
import "./pages/draftDrops.ts";
import "./pages/payouts.ts";
import "./pages/publishedDrops.ts";
import "./pages/unpublishedDrops.ts";

import { RegisterAuthRefresh, sheetStack } from "shared/helper.ts";
import { Navigation } from "shared/navigation.ts";
import { API, stupidErrorAlert } from "shared/restSpec.ts";
import { activeRoute, appendBody, Box, Content, createRoute, css, DialogContainer, FullWidthSection, PrimaryButton, StartRouting, WebGenTheme } from "webgen/mod.ts";
import "../../assets/css/main.css";
import "../../assets/css/music.css";
import { DynaNavigation } from "../../components/nav.ts";
import { DropType } from "../../spec/music.ts";
import { artistsPage } from "./pages/artists.ts";
import { draftsDropsPage } from "./pages/draftDrops.ts";
import { publishedDrops } from "./pages/publishedDrops.ts";
import { createArtistSheet } from "./views/table.ts";

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

appendBody(
    WebGenTheme(
        DialogContainer(sheetStack.visible(), sheetStack),
        Content(
            FullWidthSection(
                DynaNavigation("Music"),
            ),
        ),
        Navigation(
            Box(
                activeRoute.map((route) => route === artistsPage.route.entry)
                    .map((isArtistsRoute) =>
                        isArtistsRoute
                            ? PrimaryButton("Create new Artist")
                                .onClick(() => sheetStack.addSheet(createArtistSheet()))
                            : PrimaryButton("Create new Drop")
                                .onPromiseClick(async () => {
                                    const { id } = await API.music.drops.create().then(stupidErrorAlert);
                                    location.href = `/c/music/new-drop?id=${id}`;
                                })
                    ),
            ),
        ),
    )
        .addStyle(css`
            :host {
                --wg-primary: rgb(255, 171, 82);
                --content-max-width: 1200px;
            }
        `),
);

StartRouting();
