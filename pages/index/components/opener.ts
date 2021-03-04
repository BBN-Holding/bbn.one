import { span } from "@lucsoft/webgen";
import '../../../assets/css/components/opener.css';
import heroImage from '../../../assets/img/hero-img.png';

export function renderOpener()
{
    const shell = document.createElement("div")
    shell.classList.add('opener')
    shell.id = "home";
    const leftSide = document.createElement('div')
    const mainTitle = span("We represent your interests")
    const subTitle = span("We support you in financing, distributing and marketing your music or video game all over the world.")
    const button = document.createElement('a')
    button.innerText = "Get started"
    button.href = "#services"
    leftSide.append(mainTitle, subTitle, button)
    const rightSide = document.createElement('div')
    const image = document.createElement('img')
    image.src = heroImage;
    rightSide.append(image)
    shell.append(leftSide, rightSide)

    return shell;
}