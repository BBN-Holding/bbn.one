// @deno-types="https://cdn.jsdelivr.net/npm/@types/mjml-core@4.7.1/index.d.ts"
import mjml from "https://cdn.jsdelivr.net/npm/mjml-browser@4.15.3/+esm";
import { Box, Grid, Label } from "webgen/mod.ts";
import { Drop } from "../../spec/music.ts";
import "./email.css";

export const rawTemplate = (data: string) =>
    `
<mjml>
    <mj-head>
        <mj-font name="Red Hat Display" href="https://fonts.googleapis.com/css?family=Red+Hat+Display" />
        <mj-attributes>
            <mj-text line-height="1.3"/>
            <mj-all font-family="Red Hat Display, Helvetica"/>
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
    return mjml(rawTemplate(data));
}

export function clientRender(data: string) {
    const shell = createElement("iframe");
    const mjmlrsp = render(data);
    shell.srcdoc = mjmlrsp.html;
    return Box(
        Custom(shell).addClass("emailPreview").setMargin("0 0 calc(var(--gap) / 2)"),
        Grid(
            Array.from(new Set(mjmlrsp.errors.map((x) => `${x.tagName}: ${x.message}`))).map((x) => Label(`⚠️ ${x}`)),
        ),
    );
}

export function dropPatternMatching(data: string, drop: Drop): string {
    return data
        .replaceAll("{{dropTitle}}", drop.title)
        .replaceAll("{{dropId}}", drop._id);
}
