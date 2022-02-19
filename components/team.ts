import { PlainText, View, Grid, Vertical, Button, Color, Horizontal } from "../deps.ts";
import '../assets/css/components/team.css';
import { assets } from "../assets/img/team/assets.ts";
import { actions } from "./actions.ts";
import { renderPerson } from "./profileCard.ts";
import members from '../data/members.json' assert { type: "json"};

export const renderTeam = (sizelimt?: number) =>
    View(() => Vertical(
        PlainText("Leadership", "h2")
            .setMargin("0 0 5rem"),
        Grid(
            ...members.filter((_, i) => sizelimt ? i < sizelimt : true).map(x => renderPerson(assets[ x.iconId as keyof typeof assets ], x.name, x.title, Object.entries(x.links).map(([ id, link ]) => [ actions[ id as keyof typeof actions ], link ])))
        ).setEvenColumns(1, "repeat(auto-fit,minmax(23rem,1fr))").setGap("var(--gap)"),
        sizelimt
            ? Horizontal(
                Button("View More")
                    .setColor(Color.Colored)
                    .asLinkButton("/p/leadership.html")
            ).setMargin("2rem 0 0")
            : null
    ))
        .setMaxWidth("69rem")
        .asComponent()
