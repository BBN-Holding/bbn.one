import { API, MenuNode, Navigation, stupidErrorAlert } from "shared/mod.ts";
import { sortBy } from "std/collections/sort_by.ts";
import { sumOf } from "std/collections/sum_of.ts";
import { asRef, asState, Body, isMobile, Vertical, WebGen } from "webgen/mod.ts";
import "../../assets/css/main.css";
import "../../assets/css/music.css";
import { DynaNavigation } from "../../components/nav.ts";
import { Drop, Payout } from "../../spec/music.ts";
import { changeThemeColor, RegisterAuthRefresh, renewAccessTokenIfNeeded } from "../_legacy/helper.ts";

await RegisterAuthRefresh();

WebGen({
    events: {
        themeChanged: changeThemeColor(),
    },
});

const params = new URLSearchParams(location.search);
const data = Object.fromEntries(params.entries());
if (!data.id) {
    alert("ID is missing");
    location.href = "/music";
}

const state = asState({
    payout: <Payout | undefined> undefined,
    music: <Drop[] | undefined> undefined,
    loaded: false,
});

Body(Vertical(
    DynaNavigation("Music"),
    Navigation({
        title: "View Payout",
        categories: [
            {
                id: "drop",
                title: `Drop`,
                children: state.$music.map((music) =>
                    sortBy(
                        (music?.map((drop) => {
                            const entries = state.payout?.entries.filter((entry) => drop.songs?.some((song) => song.isrc === entry.isrc)) ?? [];
                            if (entries.length === 0) return undefined;
                            return {
                                title: drop.title,
                                subtitle: `£ ${sumOf(entries.map((entry) => sumOf(entry.data, (data) => Number(data.revenue))), (e) => e).toFixed(2)} - ${sumOf(entries.map((entry) => sumOf(entry.data, (data) => Number(data.quantity))), (e) => e)} streams`,
                                id: `${drop._id}`,
                                children: drop.songs?.length > 1
                                    ? drop.songs.filter((song) => song.isrc).filter((song) => entries.some((e) => e.isrc === song.isrc)).map((song) => {
                                        const entry = entries.find((entry) => entry.isrc === song.isrc)!;
                                        return {
                                            title: song.title,
                                            subtitle: `£ ${sumOf(entry.data ?? [], (e) => Number(e.revenue)).toFixed(2)} - ${sumOf(entry.data ?? [], (e) => Number(e.quantity))} streams`,
                                            id: `${song.isrc}`,
                                            children: generateStores(entry.data ?? []),
                                        };
                                    })
                                    : generateStores(entries[0].data ?? []),
                            };
                        }) ?? []).filter(Boolean) as MenuNode[],
                        (e) => Number(asRef(e.subtitle!).getValue().split(" ")[1]),
                    ).reverse()
                ),
            },
            {
                id: "store",
                title: `Store`,
                children: state.$payout
                    ? state.$payout.map((payout) =>
                        payout
                            ? sortBy(
                                Object.entries(
                                    payout.entries.map((entry) => Object.groupBy(entry.data, (e) => e.store)).reduce((a, b) => {
                                        Object.entries(b).forEach(([key, value]) => {
                                            if (!a[key]) {
                                                a[key] = [0, 0];
                                            }
                                            a[key][0] += sumOf(value!, (e) => Number(e.revenue));
                                            a[key][1] += sumOf(value!, (e) => Number(e.quantity));
                                        });
                                        return a;
                                    }, {} as Record<string, [number, number]>),
                                ),
                                (e) => e[1][0],
                            ).reverse().map(([key, value]) => ({
                                title: key,
                                subtitle: `£ ${value[0].toFixed(2)} - ${value[1]} streams`,
                                id: `${key}`,
                            }))
                            : []
                    )
                    : [],
            },
            {
                id: "country",
                title: `Country`,
                children: state.$payout
                    ? state.$payout.map((payout) =>
                        payout
                            ? sortBy(
                                Object.entries(
                                    payout.entries.map((entry) => Object.groupBy(entry.data, (e) => e.territory)).reduce((a, b) => {
                                        Object.entries(b).forEach(([key, value]) => {
                                            if (!a[key]) {
                                                a[key] = [0, 0];
                                            }
                                            a[key][0] += sumOf(value!, (e) => Number(e.revenue));
                                            a[key][1] += sumOf(value!, (e) => Number(e.quantity));
                                        });
                                        return a;
                                    }, {} as Record<string, [number, number]>),
                                ),
                                (e) => e[1][0],
                            ).reverse().filter(([_k, [_v, streams]]) => streams !== 0).map(([key, value]) => ({
                                title: key,
                                subtitle: `£ ${value[0].toFixed(2)} - ${value[1]} streams`,
                                id: `${key}`,
                            }))
                            : []
                    )
                    : [],
            },
        ],
    }).addClass(
        isMobile.map((mobile) => mobile ? "mobile-navigation" : "navigation"),
        "limited-width",
    ),
    // .setActivePath(state.loaded ? "/drop/" : "/")
));

renewAccessTokenIfNeeded()
    .then(() => refreshState())
    .then(() => state.loaded = true);

async function refreshState() {
    state.payout = await API.payment.payouts.id(data.id).get().then(stupidErrorAlert);
    state.music = await API.music.drops.list().then(stupidErrorAlert);
    state.loaded = true;
}

function generateStores(datalist: Payout["entries"][0]["data"]) {
    return sortBy(
        datalist.filter((data) => data.quantity).map((data, index) => ({
            title: `${data.store} - ${data.territory}`,
            subtitle: `£ ${Number(data.revenue).toFixed(2)} - ${data.quantity} streams`,
            id: `${index}/`,
        })),
        (e) => Number(e.subtitle.split(" ")[1]),
    ).reverse();
}
