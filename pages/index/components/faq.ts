import { Card, createElement, modernCard, Title, View } from "@lucsoft/webgen";
import '../../../assets/css/components/team.css';

export function renderFAQ() {
    const data = createElement('article')
    data.id = "faq"
    View(({ draw }) => {
        draw(Title({
            type: "small",
            title: "FREQUENTLY ASKED QUESTIONS",
            subtitle: "Get advice and answers from BBN Holding"
        }))
        draw(Card({},
            modernCard({
                title: "How much of the income goes to me?",
                description: "You get around 95% (its a non fixed cut, in some cases you can get up to 100%) of the income from your products every month on the 21st. We keep the remaining 5% to compensate for operating costs etc."
            })
        ))
    })
        .setMaxWidth("50rem")
        .appendOn(data)

    return data;
}
