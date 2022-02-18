import { Card, createElement, custom, img, headless, Custom, PlainText } from "../deps.ts";
import none from '../assets/img/team/none.webp';
import { renderAction } from "./actions.ts";

export function renderPerson(profileImage: string | undefined, name: string, type: string, links: [ icon: string, url: string ][] = []) {
    const shell = custom('div', undefined, 'team');

    const rightSide = createElement('div');
    rightSide.append(PlainText(name).draw(), PlainText(type).draw(), ...renderAction(links));

    shell.append(img(profileImage ?? none), rightSide);
    return Card(headless(Custom(shell)));
}