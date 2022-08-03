import { SupportedThemes } from "webgen/mod.ts";
import { Style } from "webgen/src/lib/Style.ts";

export function changeThemeColor(): ((data: SupportedThemes, options: Style) => void) | undefined {
    return (data) => document.head.querySelector("meta[name=theme-color]")?.setAttribute("content", data == SupportedThemes.autoLight ? "#e6e6e6" : "#0a0a0a");
}

export function changePage<TypeT extends { route: string; }>(update: (data: Partial<TypeT>) => void, type: TypeT[ "route" ]) {
    return () => {
        const url = new URL(location.toString());
        url.searchParams.set("route", type);
        history.pushState({}, '', url);
        update({ route: type } as Partial<TypeT>);
    };
}