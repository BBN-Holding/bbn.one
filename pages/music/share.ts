import { API, stupidErrorAlert } from "shared/restSpec.ts";
import { asRef, Body, Empty, Horizontal, Image, Label, LinkButton, Vertical, WebGen } from "webgen/mod.ts";
import { changeThemeColor, sheetStack, streamingImages } from "../shared/helper.ts";
import "./share.css";

WebGen({
    events: {
        themeChanged: changeThemeColor(),
    },
});

const params = new URLSearchParams(location.search);
const data = Object.fromEntries(params.entries());
if (!data.s) {
    location.href = "https://bbn.one/";
    data.s = location.pathname.replace("/", "");
    if (!data.s) {
        location.href = "https://bbn.one/";
    }
}

const share = asRef(
    <undefined | {
        services: Record<string, string>;
        title: string;
        artistNames: string[];
        artwork: string;
    }> undefined,
);

const reqShare = await API.music.share(data.s).get();
if (reqShare.status === "rejected") {
    location.href = "https://bbn.one/";
}

share.setValue(stupidErrorAlert(reqShare));

sheetStack.setDefault(Vertical(
    Image({ type: "direct", source: () => API.music.share(data.s).artwork().then(stupidErrorAlert) }, "Background").addClass("bgImg"),
    share.map((shareVal) =>
        shareVal
            ? Horizontal(
                Vertical(
                    Image({ type: "direct", source: () => API.music.share(data.s).artwork().then(stupidErrorAlert) }, "A Song Artwork")
                        .setMinHeight("250px").setMinWidth("250px").setBorderRadius("mid"),
                    Label(shareVal.title).setTextAlign("center").setTextSize("2xl").setMargin("0 10px 0 0"),
                    Label(shareVal.artistNames.join(", ")).setTextAlign("center"),
                    Vertical(
                        ...Object.entries(shareVal.services).map(([key, val]) =>
                            LinkButton(
                                Horizontal(
                                    streamingImages[key]
                                        .setHeight("1.5rem")
                                        .setWidth("1.5rem").setMargin("0 10px 0 0"),
                                    Label(key[0].toUpperCase() + key.slice(1)).setTextSize("xl"),
                                ),
                                val,
                                "_blank",
                            )
                        ),
                    ).setGap("0.5rem").setMargin("10px 0 0 0"),
                    Label("Powered by BBN Music").setTextAlign("center").setMargin("10px 0 0 0"),
                ).addClass("share").setPadding("1rem").setBorderRadius("mid"),
            )
            : Empty()
    ).asRefComponent(),
));

Body(sheetStack);
