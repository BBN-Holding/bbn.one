import { Page, Wizard } from "webgen/mod.ts";
import { ActionBar } from "../misc/actionbar.ts";
import { changePage, HandleSubmit, setErrorMessage } from "../misc/common.ts";
import { API, Drop } from "../RESTSpec.ts";
import { EditViewState } from "./types.ts";
import { ManageSongs } from "./table.ts";

export function ChangeSongs(drop: Drop, update: (data: Partial<EditViewState>) => void) {
    return Wizard({
        submitAction: async ([ { data: { data } } ]) => {
            await API.music(API.getToken())
                .id(drop._id)
                .put(data);
            location.reload(); // Handle this Smarter => Make it a Reload Event.
        },
        buttonArrangement: ({ PageValid, Submit }) => {
            setErrorMessage();
            return ActionBar("Songs", undefined, {
                title: "Update", onclick: HandleSubmit(PageValid, Submit)
            }, [ { title: drop.title || "(no title)", onclick: changePage(update, "main") } ]);
        },
        buttonAlignment: "top",
    }, () => [
        Page({
            songs: drop.songs
        }, data => [
            ManageSongs(data)
        ]).setValidator((v) => v.object({
            loading: v.void(),
            song: v.string().or(v.array(v.string()))
        }))
    ]
    );
}