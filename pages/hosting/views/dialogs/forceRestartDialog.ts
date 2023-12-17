import { API, stupidErrorAlert } from "shared/mod.ts";
import { Box, Color, Label } from "webgen/mod.ts";

export function forceRestartDialog(serverId: string) {
    Dialog(() => Box(Label("Force Restarting the Server could lead to data loss depending on the State of the Server. Use at your own risk.")).setMargin("0 0 1.5rem"))
        .setTitle("Are you sure?")
        .addButton("Cancel", "remove")
        .addButton("Force Restart", async () => {
            await API.hosting.serverId(serverId).forcerestart()
                .then(stupidErrorAlert)
                .catch(() => { });
            location.reload();
            return "remove" as const;
        }, Color.Critical)
        .allowUserClose()
        .open();
}
