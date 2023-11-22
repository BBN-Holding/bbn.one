import { API, MenuNode, Navigation, stupidErrorAlert } from "shared/mod.ts";
import { groupBy } from "std/collections/group_by.ts";
import { sortBy } from "std/collections/sort_by.ts";
import { sumOf } from "std/collections/sum_of.ts";
import { State, Vertical, View, WebGen, asPointer, isMobile } from "webgen/mod.ts";
import '../../assets/css/main.css';
import '../../assets/css/music.css';
import { DynaNavigation } from "../../components/nav.ts";
import { Drop, Payout } from "../../spec/music.ts";
import { RegisterAuthRefresh, changeThemeColor, permCheck, renewAccessTokenIfNeeded } from "../_legacy/helper.ts";

await RegisterAuthRefresh();

WebGen({
    events: {
        themeChanged: changeThemeColor()
    }
});

const params = new URLSearchParams(location.search);
const data = Object.fromEntries(params.entries());
if (!data.id) {
    alert("ID is missing");
    location.href = "/music";
}

const state = State({
    payout: <Payout | undefined>undefined,
    music: <Drop[] | undefined>undefined,
    loaded: false
});

View(() => Vertical(
    DynaNavigation("Music"),
    Navigation({
        title: "View Payout",
        categories: [
            {
                id: "drop",
                title: `Drop`,
                children: state.$music.map(music => sortBy((music?.map(drop => {
                    const entries = state.payout?.entries.filter(entry => drop.songs?.some(song => song.isrc === entry.isrc)) ?? [];
                    if (entries.length === 0) return undefined;
                    return {
                        title: drop.title,
                        subtitle: `£ ${sumOf(entries.map((entry) => sumOf(entry.data, (data) => Number(data.revenue))), e => e).toFixed(2)} - ${sumOf(entries.map((entry) => sumOf(entry.data, (data) => Number(data.quantity))), e => e)} streams`,
                        id: `${drop._id}`,
                        children: drop.songs?.length > 1 ? drop.songs.filter(song => song.isrc).filter(song => entries.some(e => e.isrc === song.isrc)).map(song => {
                            const entry = entries.find(entry => entry.isrc === song.isrc)!;
                            return {
                                title: song.title,
                                subtitle: `£ ${sumOf(entry.data ?? [], e => Number(e.revenue)).toFixed(2)} - ${sumOf(entry.data ?? [], e => Number(e.quantity))} streams`,
                                id: `${song.isrc}`,
                                children: generateStores(entry.data ?? [])
                            };
                        }) : generateStores(entries[ 0 ].data ?? [])
                    };
                }) ?? []).filter(Boolean) as MenuNode[], e => Number(asPointer(e.subtitle!).getValue().split(" ")[ 1 ])).reverse())
            },
            {
                id: "store",
                title: `Store`,
                children: state.$payout ? state.$payout.map(payout => payout ? sortBy(Object.entries(payout.entries.map(entry => groupBy(entry.data, e => e.store)).reduce((a, b) => {
                    Object.entries(b).forEach(([ key, value ]) => {
                        if (!a[ key ]) {
                            a[ key ] = [ 0, 0 ];
                        }
                        a[ key ][ 0 ] += sumOf(value!, e => Number(e.revenue));
                        a[ key ][ 1 ] += sumOf(value!, e => Number(e.quantity));
                    });
                    return a;
                }, {} as Record<string, [ number, number ]>)), e => e[ 1 ][ 0 ]).reverse().map(([ key, value ]) => ({
                    title: key,
                    subtitle: `£ ${value[ 0 ].toFixed(2)} - ${value[ 1 ]} streams`,
                    id: `${key}`
                })) : []) : []
            },
            {
                id: "country",
                title: `Country`,
                children: state.$payout ? state.$payout.map(payout => payout ? sortBy(Object.entries(payout.entries.map(entry => groupBy(entry.data, e => e.territory)).reduce((a, b) => {
                    Object.entries(b).forEach(([ key, value ]) => {
                        if (!a[ key ]) {
                            a[ key ] = [ 0, 0 ];
                        }
                        a[ key ][ 0 ] += sumOf(value!, e => Number(e.revenue));
                        a[ key ][ 1 ] += sumOf(value!, e => Number(e.quantity));
                    });
                    return a;
                }, {} as Record<string, [ number, number ]>)), e => e[ 1 ][ 0 ]).reverse().filter(([ _k, _v, streams ]) => streams !== 0).map(([ key, value ]) => ({
                    title: key,
                    subtitle: `£ ${value[ 0 ].toFixed(2)} - ${value[ 1 ]} streams`,
                    id: `${key}`
                })) : []) : []
            },
        ]
    }).addClass(
        isMobile.map(mobile => mobile ? "mobile-navigation" : "navigation"),
        "limited-width"
    )
    // .setActivePath(state.loaded ? "/drop/" : "/")
)
).appendOn(document.body);

renewAccessTokenIfNeeded()
    .then(() => refreshState())
    .then(() => state.loaded = true);

async function refreshState() {
    state.payout = permCheck("/hmsys/user/manage", "/bbn/manage") ? await API.admin.payouts.id(data.id).get().then(stupidErrorAlert) : await API.payment.payouts.id(data.id).get().then(stupidErrorAlert);
    if (data.userid && state.payout) {
        state.payout.entries = state.payout.entries.filter(entry => entry.user === data.userid);
    }
    state.music = permCheck("/hmsys/user/manage", "/bbn/manage") ? await API.admin.drops.list(undefined, undefined, 50000).then(stupidErrorAlert) : await API.music.drops.list().then(stupidErrorAlert);
    state.loaded = true;
}

function generateStores(datalist: Payout[ "entries" ][ 0 ][ "data" ]) {
    return sortBy(datalist.filter(data => data.quantity).map((data, index) => ({
        title: `${data.store} - ${data.territory}`,
        subtitle: `£ ${Number(data.revenue).toFixed(2)} - ${data.quantity} streams`,
        id: `${index}/`
    })) as MenuNode[], e => Number(asPointer(e.subtitle!).getValue().split(" ")[ 1 ])).reverse();
}