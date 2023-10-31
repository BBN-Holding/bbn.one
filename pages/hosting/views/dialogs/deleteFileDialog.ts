import { deferred } from "std/async/deferred.ts";
import { Box, Color, Dialog, Label } from "webgen/mod.ts";

export function deleteFileDialog() {
    const response = deferred<boolean>();
    Dialog(() => Box(Label("Deleting this File, will result in data loss.\nAfter this point there is no going back.")).setMargin("0 0 1.5rem"))
        .setTitle("Are you sure?")
        .addButton("Cancel", "remove")
        .addButton("Delete", () => {
            response.resolve(true);
            return "remove" as const;
        }, Color.Critical)
        .onClose(() => response.resolve(false))
        .allowUserClose()
        .open();

    return response;
}
