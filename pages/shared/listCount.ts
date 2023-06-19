import { Pointer } from "webgen/mod.ts";
import { External } from "./restSpec.ts";

export const count = (list: Pointer<External<unknown[]> | 'loading' | unknown[] | undefined>) =>
    list.map(val => {
        if (val === undefined || val === "loading") return '';
        if ('status' in val)
            return val.status === "fulfilled" ? `(${val.value.length})` : '';
        return `(${val.length})`;
    });