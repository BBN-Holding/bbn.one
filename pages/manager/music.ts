import { Button, ButtonStyle, Center, Color, Horizontal, PlainText, Spacer, Vertical, View, WebGen } from "../../deps.ts";
import '../../assets/css/main.css';
import '../../assets/css/components/subsidiaries.css';
import { DynaNavigation } from "../../components/nav.ts";
import { Redirect } from "./helper.ts";
import { API, Drop } from "./RESTSpec.ts";

WebGen({
})
Redirect();

const view = View<{ list: Drop[] }>(({ state }) => Vertical(
    DynaNavigation("Music"),
    Horizontal(
        Vertical(
            Horizontal(
                PlainText("Hi Gregor! 👋"),
                Spacer()
            ),
            Horizontal(
                Button("Published")
                    .setColor(Color.Colored),
                Button("Unpublished")
                    .setColor(Color.Colored)
                    .setStyle(ButtonStyle.Secondary),
                Spacer()
            )
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
    state.list ? PlainText("") : Center(PlainText("Wow such empty")).setPadding("5rem"),
    Vertical(
        Horizontal(
            PlainText("Latest Drop"),
            Spacer()
        ),
        Horizontal(
            Vertical(
                Spacer(),
                PlainText("FUCKSLEEP FOREVER"),
                PlainText("6 May 2022"),
                PlainText("UPC 19213124535"),
                Spacer()
            ),
            Spacer()
        )
    )
        .setWidth("100%")
        .addClass("subsidiary-list"),
    Vertical(
        Horizontal(
            PlainText("History"),
            Spacer()
        ),
        Horizontal(
            Vertical(
                Spacer(),
                PlainText("FUCKSLEEP FOREVER"),
                PlainText("6 May 2022"),
                PlainText("UPC 19213124535"),
                Spacer()
            ),
            Spacer()
        )
    )
        .setWidth("100%")
        .addClass("subsidiary-list")
))
    .appendOn(document.body);

API.music(API.getToken()).list.get()
    .then(x => view.viewOptions().update({ list: x }))