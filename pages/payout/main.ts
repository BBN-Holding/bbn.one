import { WebGen, MaterialIcons, View, Vertical, Reactive, State } from "webgen/mod.ts";
import { DynaNavigation } from "../../components/nav.ts";
import { API } from "../manager/RESTSpec.ts";
import { Redirect, RegisterAuthRefresh, permCheck, renewAccessTokenIfNeeded } from "../manager/helper.ts";
import { changeThemeColor } from "../manager/misc/common.ts";

import '../../assets/css/main.css';
import '../../assets/css/music.css';
import { Menu, MenuItem } from "../shared/Menu.ts";
import { Drop, Payout } from "../../spec/music.ts";
import { sumOf } from "std/collections/sum_of.ts";
import { LoadingSpinner } from "../shared/components.ts";


Redirect();
await RegisterAuthRefresh();

WebGen({
    icon: new MaterialIcons(),
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
    Reactive(state, "loaded", () => Menu({
        title: "View Payout",
        id: "/",
        categories: {
            "drop/": {
                title: `Drop`,
                items: (state.music?.map(drop => {
                    const entries = state.payout?.entries.filter(entry => drop.songs?.some(song => song.isrc === entry.isrc)) ?? [];
                    if (entries.length === 0) return undefined;
                    return {
                        title: drop.title,
                        subtitle: "£ " + sumOf(entries.map((entry) => sumOf(entry.data, (data) => Number(data.revenue))), e => e),
                        id: `${drop._id}/`,
                        items: drop.songs?.length > 1 ? drop.songs.filter(song => song.isrc).filter(song => entries.some(e => e.isrc === song.isrc)).map(song => {
                            const entry = entries.find(entry => entry.isrc === song.isrc)!;
                            return {
                                title: song.title,
                                subtitle: "£ " + sumOf(entry.data ?? [], e => Number(e.revenue)),
                                id: `${song.isrc}/`,
                                items: generateStores(entry.data ?? [])
                            };
                        }) : generateStores(entries[ 0 ].data ?? [])
                    };
                }) ?? []).filter(Boolean) as MenuItem[]
            },
            "store/": {
                title: `Store`,
            },
            "country/": {
                title: `Country`,
            },
        },
        custom: () => LoadingSpinner()
    }).setActivePath(state.loaded ? "/drop/" : "/"))
)).appendOn(document.body);

renewAccessTokenIfNeeded()
    .then(() => refreshState())
    .then(() => state.loaded = true);

async function refreshState() {
    state.payout = await API.payment(API.getToken()).payouts.id(data.id).get();
    state.music = permCheck("/hmsys/user/manage", "/bbn/manage") ? await API.music(API.getToken()).reviews.get() : await API.music(API.getToken()).list.get();
    state.loaded = true;
}

function generateStores(datalist: Payout[ "entries" ][ 0 ][ "data" ]) {
    return datalist.filter(data => data.quantity).map((data, index) => {
        return {
            title: data.distributor + " - " + data.territory,
            subtitle: "£ " + data.revenue + " - " + data.quantity + " streams",
            id: `${index}/`
        };
    }) as MenuItem[];
}