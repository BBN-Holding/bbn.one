import { modernCard, WebGen } from "@lucsoft/webgen";
import '../../../assets/css/components/team.css';

export function renderFAQ(web: WebGen)
{
    const data = document.createElement('article')
    data.id = "faq"
    web.elements.custom(data, { maxWidth: "50rem" })
        .title({
            type: "small",
            title: "FREQUENTLY ASKED QUESTIONS",
            subtitle: "Get advice and answers from the BBN crew"
        })
        .cards({},
            modernCard({
                title: "How much of the income goes to me?",
                description: "You get 95% of the income from your products every month on the 21st. We keep the remaining 5% to compensate for operating costs etc."
            })
        )
    return data;
}