import { CardTypes, createElement, custom, HeadlessCard, span, WebGen } from "@lucsoft/webgen";
import '../../../assets/css/components/team.css';
import team1 from '../../../assets/img/team/team-1.webp';
import team2 from '../../../assets/img/team/team-2.webp';
import team3 from '../../../assets/img/team/team-3.webp';
import team4 from '../../../assets/img/team/team-4.webp';
import team5 from '../../../assets/img/team/team-5.webp';
import team6 from '../../../assets/img/team/team-6.webp';

import { email, github, instagram, link, linkedIn, renderAction, twitter } from "./actions";
export function renderTeam(web: WebGen)
{
    const data = createElement('article')
    data.id = "team";
    const renderPerson = (profileImage: string, name: string, type: string, links: [ icon: string, url: string ][] = []): HeadlessCard =>
    {
        const shell = custom('div', undefined, 'team')

        const image = createElement('img') as HTMLImageElement
        image.src = profileImage;
        const rightSide = createElement('div')
        rightSide.append(span(name), span(type), ...renderAction(links))

        shell.append(image, rightSide)
        return {
            type: CardTypes.Headless,
            html: shell
        };
    }

    web.elements.custom(data, { maxWidth: "69rem" })
        .title({
            type: "small",
            title: "TEAM",
            subtitle: " "
        })
        .cards({ minColumnWidth: 23 },
            renderPerson(team1, "Gregor Bigalke", "Chief Executive Officer", [
                [ linkedIn, 'https://www.linkedin.com/in/gregor-bigalke-54152b197' ],
                [ twitter, 'https://twitter.com/gregtcltk' ],
                [ instagram, 'https://www.instagram.com/skidder6775/' ],
                [ github, 'https://github.com/gregtcltk' ],
                [ email, 'mailto:gregor.bigalke@bbn.one' ]
            ]),
            renderPerson(team5, "Lucas Jank", "Chief Design Officer", [
                [ linkedIn, "https://www.linkedin.com/in/lucsoft/" ],
                [ twitter, "https://twitter.com/lucsoft_" ],
                [ instagram, 'https://www.instagram.com/lucsoft_/' ],
                [ github, 'https://github.com/lucsoft' ],
                [ link, 'https://lucsoft.de' ],
                [ email, 'mailto:lucas.jrichardson@bbn.one' ]
            ]),
            renderPerson(team3, "Maximilian Arzberger", "Chief Operating Officer", [
                [ linkedIn, 'https://linkedin.com/in/maximilian-arzberger-5877a51b9' ],
                [ twitter, 'https://twitter.com/Hax6775' ],
                [ instagram, 'https://www.instagram.com/hax6775/' ],
                [ github, 'https://github.com/Schlauer-Hax' ],
                [ email, 'mailto:maximilian.arzberger@bbn.one' ]
            ]),
            renderPerson(team2, "Sarah Jhonson", "Product Manager", [
                [ email, 'mailto:sarah.jhonson@bbn.one' ]
            ]),
            renderPerson(team4, "Jana Holter", "Accountant", [
                [ email, 'mailto:jana.holter@bbn.one' ]
            ]),
            renderPerson(team6, "Josiah Jenkgins", "Head of Legal Department", [
                [ linkedIn, 'https://linkedin.com/in/josiah-jenkgins-115790209/' ],
                [ twitter, 'https://twitter.com/realJosiah3' ],
                [ email, 'mailto:josiah.jenkgins@bbn.one' ]
            ])
        )
    return data;
}
