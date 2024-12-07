import { API, stupidErrorAlert } from "shared/mod.ts";
import { asRef, Box, Content, createPage, createRoute, Grid, Spinner } from "webgen/mod.ts";
import { Drop, DropType } from "../../../spec/music.ts";
import { musicList } from "../views/list.ts";

const data = asRef<"loading" | Drop[]>("loading");

const source = data.map((data) => data === "loading" ? [] : data);

export const publishedDrops = createPage(
    {
        label: "Published",
        weight: -10,
        route: createRoute({
            path: "/c/music?list=published",
            events: {
                onLazyInit: async () => {
                    const list = await API.music.drops.list().then(stupidErrorAlert);
                    data.value = list.filter((x) => x.type === DropType.Published);
                },
            },
        }),
    },
    Content(
        Box(data.map((data) => data === "loading" ? Spinner() : [])),
        Grid(
            source.map((items) => musicList(items, DropType.Published)),
        ),
    ),
);
