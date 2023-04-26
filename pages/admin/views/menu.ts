import { Reactive, Vertical } from "webgen/mod.ts";
import { state } from "../state.ts";
import { Menu } from "../../shared/Menu.ts";
import { activeUser } from "../../manager/helper.ts";
import { getListCount } from "../../shared/listCount.ts";
import { LoadingSpinner } from "../../shared/components.ts";
import { upload } from "../loading.ts";
import { listReviews } from "./list.ts";
import { UserPanel } from "../users.ts";
import { listPayouts } from "../../music/views/list.ts";

export const adminMenu = () => Reactive(state, "loaded", () => Menu({
    title: `Hi ${activeUser.username} 👋`,
    id: "/",
    categories: {
        "overview/": {
            title: `Overview`,
            items: [
                {
                    id: "streams/",
                    title: "Total Streams",
                    subtitle: "1.2M"
                },
                {
                    id: "revenue/",
                    title: "Total Revenue",
                    subtitle: "$1.2M"
                },
                {
                    id: "payout/",
                    title: "Total Payouts",
                    subtitle: "$1.2M"
                }
            ]
        },
        "reviews/": {
            title: `Music Reviews ${getListCount(state.reviews)}`,
            custom: () => Reactive(state, "reviews", () =>
                listReviews()
            )
        },
        "users/": {
            title: `User ${getListCount(state.users)}`,
            custom: () => Reactive(state, "users", () =>
                UserPanel()
            )
        },
        "payouts/": {
            title: `Payout ${getListCount(state.payouts)}`,
            items: [
                {
                    title: "Upload Payout File (.xlsx)",
                    id: "upload+manual/",
                    action: () => upload("manual")
                },
                {
                    title: "Sync ISRCs (release_export.xlsx)",
                    id: "sync+isrc/",
                    action: () => upload("isrc")
                }
            ],
            custom: () => Reactive(state, "payouts", () =>
                Vertical(listPayouts(state.payouts ?? []))
                    .setGap("0.5rem")
            )
        }
    },
    custom: () => LoadingSpinner()
})
    .setActivePath(!state.loaded ? '/' : '/overview/')
);