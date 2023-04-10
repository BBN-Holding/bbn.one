// @deno-types="https://cdn.jsdelivr.net/npm/@types/mjml-core@4.7.0/index.d.ts"
import mjml from "https://cdn.jsdelivr.net/npm/mjml-browser@4.13.0/+esm";
import { Box, createElement, Custom, PlainText, Vertical } from "webgen/mod.ts";
import { Drop } from "../../spec/music.ts";
import './email.css';

export const rawTemplate = (data: string) => `
<mjml>
    <mj-head>
        <mj-font name="Open Sans" href="https://fonts.googleapis.com/css?family=Open+Sans" />
        <mj-attributes>
            <mj-text line-height="1.3"/>
            <mj-all font-family="Open Sans"/>
            <mj-button background-color=\"#F19D2D\" color=\"black\">
        </mj-attributes>
    </mj-head>
    <mj-body>
        <mj-section background-color="white">
            <mj-column width="80%"><mj-image padding="0" src="https://bbn.one/email-header.png"></mj-image></mj-column>
            ${data}
        </mj-section>
    </mj-body>
</mjml>
`.trim();

export function render(data: string) {
    const rsp = mjml(rawTemplate(data));
    console.log(rsp);
    return rsp;
}

export function clientRender(data: string) {
    const shell = createElement("iframe");
    const mjmlrsp = render(data);
    shell.srcdoc = mjmlrsp.html;
    return Box(
        Custom(shell).addClass("emailPreview").setMargin("0 0 calc(var(--gap) / 2)"),
        Vertical(
            Array.from(new Set(mjmlrsp.errors.map(x => x.tagName + ": " + x.message))).map(x => PlainText("⚠️ " + x))
        )
    );
}

export function dropPatternMatching(data: string, drop: Drop): string {
    return data
        .replaceAll("{{dropTitle}}", drop.title)
        .replaceAll("{{dropId}}", drop._id);
}
