import { SafeParseReturnType } from "https://deno.land/x/zod@v3.19.1/types.ts";
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

// deno-lint-ignore no-explicit-any
export async function Validate(PageValid: () => Promise<SafeParseReturnType<any, any>>, run: () => void | Promise<void>) {
    const newLocal = await PageValid();
    if (newLocal.success === true) {
        document.querySelector<HTMLElement>("#error-message-area")!.innerText = "";
        run();
    } else {
        document.querySelector<HTMLElement>("#error-message-area")!.innerText = newLocal.error.errors.map(x => x.message).join("\n");
    }
}
