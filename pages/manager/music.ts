import { Button, ButtonStyle, loadingWheel, Center, Color, Horizontal, PlainText, Spacer, Vertical, View, WebGen, Custom, Box } from "../../deps.ts";
import '../../assets/css/main.css';
import '../../assets/css/components/subsidiaries.css';
import { DynaNavigation } from "../../components/nav.ts";
import { GetCachedProfileData, ProfileData, Redirect } from "./helper.ts";
import { API, Drop } from "./RESTSpec.ts";

WebGen({
})
Redirect();

const view = View<{ list: Drop[], type: Drop[ "type" ], aboutMe: ProfileData }>(({ state, update }) => Vertical(
    DynaNavigation("Music"),
    Horizontal(
        Vertical(
            Horizontal(
                PlainText(`Hi ${state.aboutMe?.name}! 👋`)
                    .setFont(2.260625, 700),
                Spacer()
            ).setMargin("0 0 18px"),
            Horizontal(
                Button("Published")
                    .setColor(Color.Colored)
                    .addClass("tag")
                    .setStyle(state.type == "PUBLISHED" ? ButtonStyle.Normal : ButtonStyle.Secondary)
                    .onClick(() => update({ type: "PUBLISHED" })),
                Button("Unpublished")
                    .setColor(Color.Colored)
                    .setStyle(state.type == "PRIVATE" ? ButtonStyle.Normal : ButtonStyle.Secondary)
                    .onClick(() => update({ type: "PRIVATE" }))
                    .addClass("tag"),
                state.list?.find(x => x.type == "UNSUBMITTED") ?
                    Button(`Drafts (${state.list.filter(x => x.type == "UNSUBMITTED").length})`)
                        .setColor(Color.Colored)
                        .onClick(() => update({ type: "UNSUBMITTED" }))
                        .setStyle(state.type == "UNSUBMITTED" ? ButtonStyle.Normal : ButtonStyle.Secondary)
                        .addClass("tag")
                    : null,
                Spacer()
            ).setGap("10px")
        ),
        Spacer(),
        Vertical(
            Spacer(),
            Button("Submit new Drop")
                .onPromiseClick(async () => {
                    const id = await API.music(API.getToken()).post();
                    // Currently not supported:
                    // location.href = `/music/new-drop/${id}`;
                    location.href = `/music/new-drop?id=${id}`;
                }),
            Spacer()
        )
    )
        .setPadding("5rem 0 0 0")
        .addClass("subsidiary-list"),
    Box((() => {
        if (!state.list)
            return Custom(loadingWheel() as Element as HTMLElement)
        if (state.list.length != 0)
            return Vertical(
                state.list
                    .filter(x => state.type == "PUBLISHED" ? x.type == "PUBLISHED" : true)
                    .filter(x => state.type == "PRIVATE" ? x.type == "PRIVATE" || x.type == "UNDER_REVIEW" : true)
                    .filter(x => state.type == "UNSUBMITTED" ? x.type == "UNSUBMITTED" : true)
                    .map(x => Horizontal(
                        // Horizontal(
                        //     PlainText("Latest Drop"),
                        //     Spacer()
                        // ),
                        Vertical(
                            Spacer(),
                            PlainText(x.title ?? "(no name)"),
                            PlainText(x.release ?? "(no release date)"),
                            PlainText(x.upc ? `UPC ${x.upc}` : "(no upc number)"),
                            Spacer()
                        ),
                        Spacer()
                    ))
            ).setWidth("100%")
                .addClass("subsidiary-list");
        return Center(PlainText("Wow such empty")).setPadding("5rem");
    })()).addClass("loading"),
))
    .change(({ update }) => update({ type: "PUBLISHED", aboutMe: GetCachedProfileData() }))
    .appendOn(document.body);

API.music(API.getToken()).list.get()
    .then(x => view.viewOptions().update({ list: x }))