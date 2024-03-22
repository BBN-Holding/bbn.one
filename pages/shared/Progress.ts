import { Box, createElement, Custom, isRef, Label, Refable } from "webgen/mod.ts";

export function Progress(progress: Refable<number>) {
    return Box(
        Custom((() => {
            if (progress == -1) return Label("⚠️ Failed to upload!").addClass("error-message").setTextSize("sm").draw();
            const element = createElement("progress");
            if (isRef<number>(progress)) {
                progress.listen((value) => element.value = value);
                element.max = 100;
            } else {
                element.value = progress;
                element.max = 110;
            }
            return element;
        })()).addClass("low-level"),
    );
}
