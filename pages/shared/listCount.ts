import { Pointer, refMap } from "webgen/mod.ts";
import { External } from "./restSpec.ts";

export const count = (list: Pointer<External<unknown[]> | unknown[] | undefined>) =>
    refMap(list, val => {
        if (val === undefined || val === "loading") return '';
        if ('status' in val)
            return val.status === "fulfilled" ? `(${val.status.length})` : '';
        return `(${val.length})`;
    });