import { Card, createElement, Grid, modernCard, PlainText, View } from "../../../deps.ts";
import '../../../assets/css/components/team.css';

export function renderFAQ() {
    const data = createElement('article')
    data.id = "faq"
    View(({ use: draw }) => {
        draw(PlainText("FREQUENTLY ASKED QUESTIONS", "h2"));
        draw(PlainText("Get advice and answers from BBN Holding", "h4"));
        draw(Grid(
            Card(modernCard({
                title: "How much of the income goes to me?",
                description: PlainText("BBN Music gives you 100% of the income from your products every month on the 21st. BBN Music is the only company in the whole industry that does not take a revenue cut.")
            }))
        ))
    })
        .setMaxWidth("50rem")
        .appendOn(data)

    return data;
}
