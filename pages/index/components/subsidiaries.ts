import subsidiary1 from '../../../assets/img/subsidiaries/subsidiary-1.svg';
import subsidiary2 from '../../../assets/img/subsidiaries/subsidiary-2.svg';
import subsidiary3 from '../../../assets/img/subsidiaries/subsidiary-3.svg';
import subsidiary4 from '../../../assets/img/subsidiaries/subsidiary-4.svg';
import subsidiary5 from '../../../assets/img/subsidiaries/subsidiary-5.svg';

import '../../../assets/css/components/subsidiaries.css';
import { img, PlainText } from "../../../deps.ts";

export function renderSubsidiaries() {
    const ul = PlainText('').addClass('subsidiary-List').draw();

    ul.append(...[
        subsidiary1,
        subsidiary2,
        subsidiary3,
        subsidiary4,
        subsidiary5
    ].map(x => img(x)))

    return ul;
}
