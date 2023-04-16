// deno-lint-ignore no-explicit-any
export function getListCount(list?: any[]) {
    if (typeof list?.length == "number") return `(${list.length})`;
    return "";
}
