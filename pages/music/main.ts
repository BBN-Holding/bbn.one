import { RegisterAuthRefresh, renewAccessTokenIfNeeded, sheetStack } from "shared/helper.ts";
import { API, stupidErrorAlert } from "shared/restSpec.ts";
import { appendBody, Content, DialogContainer, WebGenTheme } from "webgen/mod.ts";
import "../../assets/css/main.css";
import "../../assets/css/music.css";
import { DynaNavigation } from "../../components/nav.ts";
import { DropType } from "../../spec/music.ts";
import { menuState, musicMenu } from "./views/menu.ts";

await RegisterAuthRefresh();

appendBody(
    WebGenTheme(
        DialogContainer(sheetStack.visible(), sheetStack),
        Content(
            DynaNavigation("Music"),
            musicMenu,
        ),
    ),
);

renewAccessTokenIfNeeded()
    .then(async () => {
        const list = await API.music.drops.list().then(stupidErrorAlert);

        menuState.published = list.filter((x) => x.type === DropType.Published);
        menuState.drafts = list.filter((x) => x.type === DropType.Unsubmitted);
        menuState.unpublished = list.filter((x) =>
            x.type === DropType.UnderReview ||
            x.type === DropType.Private ||
            x.type === DropType.ReviewDeclined
        );
        menuState.payouts = await API.payment.payouts.get().then(stupidErrorAlert);
        menuState.artists = await API.music.artists.list().then(stupidErrorAlert);
    });
