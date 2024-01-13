import { API, stupidErrorAlert } from "shared/restSpec.ts";
import { Button, Color, Grid, Label, SheetDialog } from "webgen/mod.ts";
import { sheetStack } from "../../../_legacy/helper.ts";

export const forceRestartDialog = (serverId: string) => {
    const sheet = SheetDialog(sheetStack, "Force Restart",
        Grid(
            Label("Force Restarting the Server could lead to data loss depending on the State of the Server. Use at your own risk."),
            Grid(
                Label("Are you sure?"),
                Grid(
                    Button("Cancel").onClick(() => sheet.close()),
                    Button("Force Restart").setColor(Color.Critical).onClick(async () => {
                        await API.hosting.serverId(serverId).forcerestart()
                            .then(stupidErrorAlert);
                        location.reload();
                    })
                ).setGap("2rem").setEvenColumns(2)
            ).setGap("1rem")
        ).setGap().setMargin("1.5rem")
    );
    return sheet;
};
