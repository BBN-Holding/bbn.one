import { CardTypes, HeadlessCard, span, WebGen } from "@lucsoft/webgen";
import '../../../assets/css/components/team.css';
import team1 from '../../../assets/img/team/team-1.webp';
import team2 from '../../../assets/img/team/team-2.webp';
import team3 from '../../../assets/img/team/team-3.webp';
import team4 from '../../../assets/img/team/team-4.webp';
import { github, instagram, linkedIn, renderAction, twitter } from "./actions";
export function renderTeam(web: WebGen)
{
    const data = document.createElement('article')
    data.id = "team";
    const renderPerson = (profileImage: string, name: string, type: string, links: [ icon: string, url: string ][] = []): HeadlessCard =>
    {
        const shell = document.createElement('div')
        shell.classList.add('team')

        const image = document.createElement('img')
        image.src = profileImage;
        const rightSide = document.createElement('div')
        rightSide.append(span(name), span(type), ...renderAction(links))

        shell.append(image, rightSide)
        return {
            type: CardTypes.Headless,
            html: shell
        };
    }

    web.elements.custom(data)
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
                [ github, 'https://github.com/gregtcltk' ]
            ]),
            renderPerson(team2, "Sarah Jhonson", "Product Manager"),
            renderPerson(team3, "Maximilian Arzberger", "Chief Operating Officer", [
                [ linkedIn, 'https://linkedin.com/in/maximilian-arzberger-5877a51b9' ],
                [ twitter, 'https://twitter.com/Hax6775' ],
                [ instagram, 'https://www.instagram.com/hax6775/' ],
                [ github, 'https://github.com/Schlauer-Hax' ]
            ]),
            renderPerson(team4, "Jana Holter", "Accountant")
        )
    return data;
}