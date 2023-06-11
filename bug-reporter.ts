// deno-lint-ignore-file no-explicit-any
import { API } from "./pages/shared/restSpec.ts";
// @deno-types="https://raw.githubusercontent.com/DefinitelyTyped/DefinitelyTyped/master/types/platform/index.d.ts"
import * as browser from "https://unpkg.com/platform.js@1.0.0/index.js";

globalThis.onunhandledrejection = (e) => {
    report(e.reason);
};

globalThis.onerror = (e) => {
    report(typeof e == "string" ? e : (<ErrorEvent>e).error);
};

function report(e: any) {
    const msg = typeof e == "string" ? e : (<ErrorEvent>e).error;
    API.bugReport({
        type: "web-frontend",
        platform: browser.os?.family ?? "-",
        platformVersion: browser.os?.version ?? "-",
        error: msg instanceof Error ? msg.stack : msg,
        browserVersion: browser.name + " v" + browser.version
    });
}