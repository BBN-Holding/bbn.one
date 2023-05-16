import { Card, createElement, custom, img, Custom, PlainText } from "webgen/mod.ts";
import none from '../assets/img/team/none.webp';
import { renderAction } from "./actions.ts";

// TODO: Refactor this to stack based layout
export function renderPerson(profileImage: string | undefined, name: string, type: string, links: [ icon: string, url: string ][] = []) {
    const shell = custom('div', undefined, 'team');

    const rightSide = createElement('div');
    rightSide.append(PlainText(name).draw(), PlainText(type).draw(), ...renderAction(links));

    shell.append(img(profileImage ?? none), rightSide);
    return Card(Custom(shell));
}