import { Box, createElement, Custom, isPointer, Label, Pointable } from "webgen/mod.ts";

export function Progress(progress: Pointable<number>) {
    return Box(
        Custom((() => {
            if (progress == -1) return Label("⚠️ Failed to upload!").addClass("error-message").setFont(0.8).draw();
            const element = createElement("progress");
            if (isPointer(progress)) {
                progress.listen((value) => {
                    element.value = value;
                });
                element.max = 100;
            } else {
                element.value = progress;
                element.max = 110;
            }
            return element;
        })()).addClass("low-level"));
}
