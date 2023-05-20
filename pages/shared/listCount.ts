import { Pointer, refMap } from "webgen/mod.ts";

export const count = (list: Pointer<unknown[] | undefined>) => refMap(list, val => typeof val?.length == "number" ? `(${val.length})` : "");