// @deno-types="https://cdn.jsdelivr.net/npm/@types/mjml-core@4.7.0/index.d.ts"
import mjml from "https://cdn.jsdelivr.net/npm/mjml-browser@4.13.0/+esm";
import { createElement, Custom } from "webgen/mod.ts";
import { Drop } from "../../../spec/music.ts";
import './email.css';

const rawTemplate = (data: string) => `
<mjml>
    <mj-head>
        <mj-font name="Open Sans" href="https://fonts.googleapis.com/css?family=Open+Sans" />
        <mj-attributes>
            <mj-text line-height=""/>
            <mj-all font-family="Open Sans"/>
            <mj-button background-color=\"#F19D2D\" color=\"black\">
        </mj-attributes>
    </mj-head>
    <mj-body>
        <mj-section background-color="#F6F6F6" padding="20px 20px">
            <mj-column background-color="#FFFFFF">
            ${data}
            </mj-column>
        </mj-section>
    </mj-body>
</mjml>
`.trim();

export function render(data: string) {
    const rsp = mjml(rawTemplate(data));
    console.log(rsp);
    return rsp;
}

export function clientRender(data: string, drop: Drop) {
    const shell = createElement("iframe");
    shell.srcdoc = render(data
        .replaceAll("{{dropTitle}}", drop.title)
        .replaceAll("{{dropId}}", drop._id)
    ).html;
    return Custom(shell).addClass("emailPreview").setMargin("0 0 calc(var(--gap) / 2)");
}