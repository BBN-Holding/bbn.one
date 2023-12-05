import { API, stupidErrorAlert } from "shared/mod.ts";
import { Box, Color, Dialog, Label } from "webgen/mod.ts";

export function deleteServerDialog(serverId: string) {
    Dialog(() => Box(Label("Deleting this Server will result in data loss.\nAfter this point there is no going back.")).setMargin("0 0 1.5rem"))
        .setTitle("Are you sure?")
        .addButton("Cancel", "remove")
        .addButton("Delete", async () => {
            await API.hosting.serverId(serverId).delete()
                .then(stupidErrorAlert)
                .catch(() => { });
            location.href = "/hosting";
            return "remove" as const;
        }, Color.Critical)
        .allowUserClose()
        .open();
}
