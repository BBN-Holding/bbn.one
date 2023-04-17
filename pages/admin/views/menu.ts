import { Reactive, Vertical } from "https://raw.githubusercontent.com/lucsoft/WebGen/3f922fc/mod.ts";
import { state } from "../state.ts";
import { Menu } from "../../shared/Menu.ts";
import { activeUser } from "../../manager/helper.ts";
import { getListCount } from "../../shared/listCount.ts";
import { LoadingSpinner } from "../../shared/components.ts";
import { upload } from "../loading.ts";
import { listReviews, listPayouts } from "./list.ts";
import { UserPanel } from "../users.ts";

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
                    title: "Upload Manual xlsx file",
                    id: "upload+manual/",
                    action: () => upload("manual")
                },
                {
                    title: "Sync ISRCs",
                    id: "sync+isrc/",
                    action: () => upload("isrc")
                }
            ],
            custom: () => Reactive(state, "payouts", () =>
                Vertical(listPayouts())
                    .setGap("0.5rem")
            )
        }
    },
    custom: () => LoadingSpinner()
})
    .setActivePath(!state.loaded ? '/' : '/overview/')
);