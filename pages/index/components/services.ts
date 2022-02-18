import { Card, createElement, Grid, modernCard, View, PlainText } from "../../../deps.ts";
import services from "../../../data/services.json" assert { type: "json" };

export function renderServices() {
    const data = createElement('article')
    data.id = "services";
    View(({ use }) => {
        use(PlainText("SERVICES", "h2"))
        use(PlainText("We offer our partners and customers a wide range of services.", "h4"))
        use(Grid(...services.map(x => Card(modernCard({
            icon: {
                svg: x.svgIcon
            },
            title: x.title,
            align: x.align as "down" | "right" | "left",
            description: PlainText(x.description)
        }))))
            .setEvenColumns(1, "repeat(auto-fit,minmax(6rem,1fr))")
            .setGap("var(--gap)")
        )
    })
        .setMaxWidth("69rem")
        .appendOn(data)
    return data;
}