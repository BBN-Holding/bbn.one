import { Reference } from "webgen/mod.ts";

export const count = (list: Reference<"loading" | unknown[]>) =>
    list.map((val) => {
        if (val === undefined || val === "loading") return "";
        return `(${val.length})`;
    });
