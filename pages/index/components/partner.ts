import client1 from '../../../assets/img/clients/client-1.svg';
import client2 from '../../../assets/img/clients/client-2.svg';
import client3 from '../../../assets/img/clients/client-3.svg';
import client4 from '../../../assets/img/clients/client-4.svg';
import client5 from '../../../assets/img/clients/client-5.svg';
import client6 from '../../../assets/img/clients/client-6.svg';

import '../../../assets/css/components/partner.css';

export function renderPartner()
{
    const ul = document.createElement('span');
    ul.classList.add('partner-List');
    const imageRender = (name: string) =>
    {
        const image = document.createElement('img');
        image.src = name;
        return image;
    }
    const list = [
        client1,
        client2,
        client3,
        client4,
        client5,
        client6
    ]
    ul.append(...list.map(x => imageRender(x)))
    return ul;
}