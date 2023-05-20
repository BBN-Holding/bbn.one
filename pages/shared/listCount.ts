import { Pointable, Pointer, refMap } from "../../../WebGen/src/State.ts";

export const count = (list: Pointer<unknown[] | undefined>) => refMap(list, val => typeof val?.length == "number" ? `(${val.length})` : "");