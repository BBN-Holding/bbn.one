import { API, stupidErrorAlert } from "shared/restSpec.ts";
import { asRef, Box, Content, createPage, createRoute, Entry, Grid, Label, Spinner } from "webgen/mod.ts";
import { Artist } from "../../../spec/music.ts";

const data = asRef<"loading" | Artist[]>("loading");

const source = data.map((data) => data === "loading" ? [] : data);

export const artistsPage = createPage(
    {
        label: "Artists",
        weight: 5,
        route: createRoute({
            path: "/c/music?list=artists",
            events: {
                onLazyInit: async () => {
                    const list = await API.music.artists.list().then(stupidErrorAlert);
                    data.value = list;
                },
            },
        }),
    },
    Content(
        Box(data.map((data) => data === "loading" ? Spinner() : [])),
        Grid(
            source.map((items) =>
                items.map((item) =>
                    Entry(
                        Label(item.name),
                    )
                )
            ),
        ),
    ),
);
