import { WebGen, MaterialIcons, View, Vertical, CenterV, Center, Custom, loadingWheel, Spacer, Reactive, State, StateData, PlainText } from "webgen/mod.ts";
import { DynaNavigation } from "../../components/nav.ts";
import { API } from "../manager/RESTSpec.ts";
import { Redirect, RegisterAuthRefresh, permCheck } from "../manager/helper.ts";
import { changeThemeColor } from "../manager/misc/common.ts";
import { ChangeDrop } from "../manager/music/changeDrop.ts";
import { ChangeMain } from "../manager/music/changeMain.ts";
import { ChangeSongs } from "../manager/music/changeSongs.ts";
import { EditViewState } from "../manager/music/types.ts";

import '../../assets/css/main.css';
import '../../assets/css/music.css';
import { Entry } from "../manager/misc/Entry.ts";
import { Menu } from "../shared/Menu.ts";
import { listPayouts } from "../music/views/list.ts";
import { Drop, Payout } from "../../spec/music.ts";


Redirect();
await RegisterAuthRefresh();

if (!permCheck(
    "/hmsys/user/manage",
    "/bbn/manage"
)) {
    location.href = "/";
}

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

View((state) => Vertical(
    DynaNavigation("Music"),
    Menu({
        title: "View Payout",
        id: "/",
        categories: {
            "drop/": {
                title: `Drop`,
                custom: () => renderEntries("drop", state.state)
            },
            "store/": {
                title: `Store`,
            },
            "country/": {
                title: `Country`,
            },
        }
    }),
))
    .appendOn(document.body)
    .change(({ update }) => {
        API.payment(API.getToken()).payouts.id(data.id).get().then(data => {
            update({ payout: data });
        });
        API.music(API.getToken()).reviews.get().then(data => {
            update({ music: data });
        });
    });

function renderEntries(type: "drop" | "store" | "country", data: { payout: Payout, music: Drop[] }) {
    console.log(data)
    switch (type) {
        case "drop": {
            // group data.payout.entries by drop
            return Object.values(data.payout.entries!.reduce((acc: any, entry) => {
                const drop = data.music.find(drop => drop.songs?.some(song => song.isrc === entry.isrc) ?? false);
                if (!drop) return acc;
                if (!acc[drop._id]) {
                    acc[drop._id] = {
                        drop,
                        entries: []
                    };
                }
                acc[drop._id].entries.push(entry);
                return acc;
            }, {})).map((data) => {
                console.log(data)
                return Entry(data.drop.title, "£ " + data.entries.map(entry => entry.data.map(data => Number(data.revenue)).reduce((a, b) => a + b, 0)).reduce((a, b) => a + b, 0))
            })
        }
        case "store":


    }
    return PlainText("Not implemented");
}