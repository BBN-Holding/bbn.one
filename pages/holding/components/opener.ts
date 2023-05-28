import { createElement, custom, img, PlainText } from "webgen/mod.ts";
import heroImage from '../../../assets/img/hero-img.png';
import './opener.css';

// TODO: refactor this to Stack based layout
export function renderOpener() {
    const opener = custom("div", undefined, "opener");
    const shell = custom("div", opener, 'opener-background');
    shell.id = "home";
    const leftSide = createElement('div');
    const mainTitle = PlainText("We represent your interests").draw();
    const subTitle = PlainText("We offer a wide range of services. From issuing prepaid credit cards to distributing music all over the world.").draw();
    const button = custom('a', "Get started") as HTMLAnchorElement;
    button.href = "/signin";
    leftSide.append(mainTitle, subTitle, button);
    const image = img(heroImage);
    image.loading = "lazy";
    const rightSide = custom('div', image);
    opener.append(leftSide, rightSide);
    return shell;
}