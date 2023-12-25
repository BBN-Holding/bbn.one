import { API, stupidErrorAlert } from "shared/restSpec.ts";
import { Button, Color, Grid, Label, Sheet } from "webgen/mod.ts";
import { hostingSheets } from "../../main.ts";

export function forceRestartDialog(serverId: string) {
    const sheet = Sheet(
        Grid(
            Label("Force Restart").setTextSize("2xl").setFontWeight("bold"),
            Label("Force Restarting the Server could lead to data loss depending on the State of the Server. Use at your own risk."),
            Grid(
                Label("Are you sure?"),
                Grid(
                    Button("Cancel").onClick(() => hostingSheets.remove(sheet)),
                    Button("Force Restart").setColor(Color.Critical).onClick(async () => {
                        await API.hosting.serverId(serverId).forcerestart()
                            .then(stupidErrorAlert);
                        location.reload();
                    })
                ).setGap("2rem").setEvenColumns(2)
            ).setGap("1rem")
        ).setGap().setMargin("1.5rem")
    );
    hostingSheets.add(sheet);
}
