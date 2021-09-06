import { Card, CommonCard, createElement, custom, img, span, Title, View, Button, Grid, Color, ButtonStyle, Horizontal } from "@lucsoft/webgen";
import '../../../assets/css/components/team.css';
import team1 from '../../../assets/img/team/team-1.webp';
import team3 from '../../../assets/img/team/team-3.webp';
import team5 from '../../../assets/img/team/team-5.webp';
import team6 from '../../../assets/img/team/team-6.webp';
import team7 from '../../../assets/img/team/team-7.webp';
import team11 from '../../../assets/img/team/team-11.webp';

import { email, github, instagram, link, linkedIn, renderAction, twitter } from "./actions";
export function renderTeam() {
    const data = createElement('article')
    data.id = "team";
    const renderPerson = (profileImage: string, name: string, type: string, links: [ icon: string, url: string ][] = []): CommonCard => ({
        getSize: () => ({}),
        draw: (card) => {
            const shell = custom('div', undefined, 'team')

            const rightSide = createElement('div')
            rightSide.append(span(name), span(type), ...renderAction(links))

            shell.append(img(profileImage), rightSide)
            card.append(shell)
            return card;
        }
    })
    View(({ use: draw }) => {
        draw(Title({
            type: "small",
            title: "TEAM",
            subtitle: " "
        }))
        draw(Grid({ minColumnWidth: 23 },
            renderPerson(team7, "Norman Welsh", "Chief Executive Officer", [
                [ email, 'mailto:norman.welsh@bbn.one' ]
            ]),
            renderPerson(team11, "Derek Blumes", "President", [
                [ email, 'mailto:derek.blumes@bbn.one' ]
            ]),
            renderPerson(team3, "Maximilian Arzberger", "Chief Operating Officer\nand Vice Chairman", [
                [ linkedIn, 'https://linkedin.com/in/maximilian-arzberger-5877a51b9' ],
                [ twitter, 'https://twitter.com/Hax6775' ],
                [ instagram, 'https://www.instagram.com/hax6775/' ],
                [ github, 'https://github.com/Schlauer-Hax' ],
                [ link, 'https://haxis.me' ],
                [ email, 'mailto:maximilian.arzberger@bbn.one' ]
            ]),
            renderPerson(team1, "Gregor Bigalke", "Chairman of the Board", [
                [ linkedIn, 'https://www.linkedin.com/in/gregor-bigalke-54152b197' ],
                [ twitter, 'https://twitter.com/greg_bbn' ],
                [ instagram, 'https://www.instagram.com/greg_bbn/' ],
                [ github, 'https://github.com/gregtcltk' ],
                [ email, 'mailto:gregor.bigalke@bbn.one' ]
            ]),
            renderPerson(team5, "Lucas Jank", "Chief Design Officer", [
                [ linkedIn, "https://www.linkedin.com/in/lucsoft/" ],
                [ twitter, "https://twitter.com/lucsoft" ],
                [ instagram, 'https://www.instagram.com/lucsoft_/' ],
                [ github, 'https://github.com/lucsoft' ],
                [ link, 'https://lucsoft.de' ],
                [ email, 'mailto:lucas.jank@bbn.one' ]
            ]),
            renderPerson(team6, "Josiah Jenkgins", "Chief Financial Officer", [
                [ linkedIn, 'https://linkedin.com/in/josiah-jenkgins-115790209/' ],
                [ twitter, 'https://twitter.com/realJosiah3' ],
                [ email, 'mailto:josiah.jenkgins@bbn.one' ]
            ])
        ))
        draw(Horizontal({ align: "center", margin: "33px" }, Button({
            color: Color.Colored,
            text: "View More",
            href: "/p/leadership.html"
        })))
    })
        .setMaxWidth("69rem")
        .appendOn(data)

    return data;
}
