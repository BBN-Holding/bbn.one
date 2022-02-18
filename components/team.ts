import { createElement, PlainText, View, Grid, Custom } from "../deps.ts";
import '../assets/css/components/team.css';
import { assets } from "../assets/img/team/assets.ts";
import { actions } from "./actions.ts";
import { renderPerson } from "./profileCard.ts";
import members from '../data/members.json' assert { type: "json"};

export function renderTeam(sizelimt: number) {
    const data = createElement('article')
    data.id = "team";
    View(({ use: draw }) => {
        draw(PlainText("Leadership", "h2"))
        draw(Grid(
            ...members.filter((_, i) => i <= sizelimt).map(x => renderPerson(assets[ x.iconId as keyof typeof assets ], x.name, x.title, Object.entries(x.links).map(([ id, link ]) => [ actions[ id as keyof typeof actions ], link ])))
        ).setGap("var(--gap)"))
    })
        .setMaxWidth("69rem")
        .appendOn(data)

    return Custom(data);
}
