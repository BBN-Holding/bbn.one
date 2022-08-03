import { Page, Wizard } from "webgen/mod.ts";
import { ActionBar } from "../misc/actionbar.ts";
import { changePage } from "../misc/common.ts";
import { Drop } from "../RESTSpec.ts";
import { EditViewState } from "./types.ts";

export function ChangeDrop(_drop: Drop, update: (data: Partial<EditViewState>) => void) {
    return Wizard({
        cancelAction: () => { },
        submitAction: () => { },
    }, () => [
        Page(_ => [
            ActionBar("Drop", undefined, undefined, [ { title: _drop.title ?? "(no-title)", onclick: changePage(update, "main") } ]),
        ])
    ]
    );
}