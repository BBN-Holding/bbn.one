import { API, stupidErrorAlert } from "shared/mod.ts";
import { asRef, Box, Content, createPage, createRoute, Entry, Grid, Label, Spinner } from "webgen/mod.ts";
import { Payout } from "../../../spec/music.ts";

const data = asRef<"loading" | Payout[]>("loading");

const source = data.map((data) => data === "loading" ? [] : data);

export const payoutsPage = createPage(
    {
        label: "Payouts",
        weight: 10,
        route: createRoute({
            path: "/c/music?list=payouts",
            events: {
                onLazyInit: async () => {
                    const list = await API.payment.payouts.get().then(stupidErrorAlert);
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
                        Label(item.period),
                    )
                )
            ),
        ),
    ),
);
