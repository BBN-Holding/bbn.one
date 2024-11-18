import { Grid, Label, Reference } from "webgen/mod.ts";
import { External } from "./restSpec.ts";

export const placeholder = (title: string, subtitle: string) =>
    Grid(
        Label(title)
            .setTextSize("4xl")
            .setFontWeight("bold")
            .addClass("list-title"),
        Label(subtitle)
            .setTextSize("xl"),
    ).setGap("1rem").setMargin("100px 0 0").setAttribute("align", "center");

export async function loadMore<T>(source: Reference<External<T[]> | "loading">, func: () => Promise<External<T[]>>) {
    const data = source.getValue();
    if (data !== "loading" && data.status !== "rejected") {
        const rsp = await func();
        source.value = rsp.status == "rejected" ? rsp : {
            status: "fulfilled",
            value: [...data.value, ...rsp.value],
        };
    }
}
