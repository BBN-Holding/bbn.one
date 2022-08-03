import { SupportedThemes } from "webgen/mod.ts";
import { Style } from "webgen/src/lib/Style.ts";

export function changeThemeColor(): ((data: SupportedThemes, options: Style) => void) | undefined {
    return (data) => document.head.querySelector("meta[name=theme-color]")?.setAttribute("content", data == SupportedThemes.autoLight ? "#e6e6e6" : "#0a0a0a");
}

export function changePage<TypeT extends { mode: string; }>(update: (data: Partial<TypeT>) => void, type: TypeT[ "mode" ]) {
    return () => {
        const url = new URL(location.toString());
        url.searchParams.set("mode", type);
        history.pushState({}, '', url);
        update({ mode: type } as Partial<TypeT>);
    };
}