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

export function setErrorMessage(rsp?: SafeParseReturnType<any, any>) {
    const hideError = !rsp || rsp.success === true;
    const err = document.querySelector<HTMLElement>("#error-message-area");
    if (!err) return;
    err.style.margin = !hideError ? "-0.8rem 0 1rem" : "0";
    err.innerText = hideError ? "" : rsp.error.errors.map(x => x.message).join("\n");
}

export function HandleSubmit(PageValid: () => Promise<SafeParseReturnType<any, any>>, Submit: () => Promise<void>): () => void | Promise<void> {
    return async () => {
        const check = await PageValid();
        setErrorMessage(check);
        if (!check.success)
            return;
        await Submit();
    };
}
