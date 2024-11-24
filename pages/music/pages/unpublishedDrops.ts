import { API, stupidErrorAlert } from "shared/mod.ts";
import { asRef, Box, Content, createPage, createRoute, Entry, Grid, Label, Spinner } from "webgen/mod.ts";
import { Drop, DropType } from "../../../spec/music.ts";

const data = asRef<"loading" | Drop[]>("loading");

const source = data.map((data) => data === "loading" ? [] : data);

export const unpublishedDropsPage = createPage(
    {
        label: "Unpublished",
        weight: -8,
        route: createRoute({
            path: "/c/music?list=unpublished",
            events: {
                onLazyInit: async () => {
                    const list = await API.music.drops.list().then(stupidErrorAlert);
                    data.value = list.filter((x) =>
                        x.type === DropType.UnderReview ||
                        x.type === DropType.Private ||
                        x.type === DropType.ReviewDeclined
                    );
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
                        Label(item.title),
                    )
                )
            ),
        ),
    ),
);
