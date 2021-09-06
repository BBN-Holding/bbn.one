import { Card, createElement, Grid, modernCard, Title, View } from "@lucsoft/webgen";
import '../../../assets/css/components/team.css';

export function renderFAQ() {
    const data = createElement('article')
    data.id = "faq"
    View(({ use: draw }) => {
        draw(Title({
            type: "small",
            title: "FREQUENTLY ASKED QUESTIONS",
            subtitle: "Get advice and answers from BBN Holding"
        }))
        draw(Grid({},
            modernCard({
                title: "How much of the income goes to me?",
                description: "BBN Music gives you 100% of the income from your products every month on the 21st. BBN Music is the only company in the whole industry that does not take a revenue cut."
            })
        ))
    })
        .setMaxWidth("50rem")
        .appendOn(data)

    return data;
}
