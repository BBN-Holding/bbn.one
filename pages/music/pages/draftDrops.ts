import { API, stupidErrorAlert } from "shared/restSpec.ts";
import { asRef, Box, Content, createPage, createRoute, Grid, Spinner } from "webgen/mod.ts";
import { Drop, DropType } from "../../../spec/music.ts";
import { musicList } from "../views/list.ts";

const data = asRef<"loading" | Drop[]>("loading");

const source = data.map((data) => data === "loading" ? [] : data);

export const draftsDropsPage = createPage(
    {
        label: "Drafts",
        weight: 0,
        route: createRoute({
            path: "/c/music?list=drafts",
            events: {
                onLazyInit: async () => {
                    const list = await API.music.drops.list().then(stupidErrorAlert);
                    data.value = list.filter((x) => x.type === DropType.Unsubmitted);
                },
            },
        }),
    },
    Content(
        Box(data.map((data) => data === "loading" ? Spinner() : [])),
        Grid(
            source.map((items) => musicList(items, DropType.Unsubmitted)),
        ),
    ),
);
