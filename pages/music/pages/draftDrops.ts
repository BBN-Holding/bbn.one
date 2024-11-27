import { API, stupidErrorAlert } from "shared/restSpec.ts";
import { asRef, Box, Content, createPage, createRoute, Entry, Grid, Label, Spinner } from "webgen/mod.ts";
import { Drop, DropType } from "../../../spec/music.ts";

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
            source.map((items) =>
                items.map((item) =>
                    Entry(
                        Label(item.title ?? "(Untitled)")
                            .setMargin("35px 0"),
                    )
                        .onClick(() => location.href = `/c/music/new-drop?id=${item._id}`)
                )
            ),
        ),
    ),
);
