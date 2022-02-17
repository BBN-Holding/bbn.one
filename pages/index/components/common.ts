import { custom } from "../../../deps.ts";

export const link = (name: string, id: string) => {
    const link = custom('a', name) as HTMLAnchorElement;
    link.href = id;
    return link;
}