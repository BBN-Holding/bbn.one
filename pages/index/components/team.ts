import { createElement, PlainText, View, Button, Grid, Color, Horizontal, Spacer } from "../../../deps.ts";
import '../../../assets/css/components/team.css';
import team1 from '../../../assets/img/team/team-1.webp';
import team3 from '../../../assets/img/team/team-3.webp';
import team5 from '../../../assets/img/team/team-5.webp';
import team6 from '../../../assets/img/team/team-6.webp';
import team7 from '../../../assets/img/team/team-7.webp';
import team11 from '../../../assets/img/team/team-11.webp';
import { email, github, instagram, link, linkedIn, twitter } from "./actions.ts";
import { renderPerson } from "../../components/profileCard.ts";

export function renderTeam() {
    const data = createElement('article')
    data.id = "team";
    View(({ use: draw }) => {
        draw(PlainText("TEAM", "h2"))
        draw(Grid(
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
        draw(Horizontal(
            Spacer(),
            Button("View More")
                .setColor(Color.Colored)
                .asLinkButton("/p/leadership.html"),
            Spacer()
        ).setMargin("33px"))
    })
        .setMaxWidth("69rem")
        .appendOn(data)

    return data;
}
