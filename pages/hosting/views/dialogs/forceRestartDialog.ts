import { API, stupidErrorAlert } from "shared/restSpec.ts";
import { Button, ButtonStyle, Color, Grid, Label, SheetDialog } from "webgen/mod.ts";
import { sheetStack } from "../../../_legacy/helper.ts";

export const forceRestartDialog = (serverId: string) => {
    const sheet = SheetDialog(sheetStack, "Hard Restart",
        Grid(
            Label("Hard Restarting the Server could lead to data loss depending on the State of the Server. Use at your own risk."),
            Grid(
                Button("Cancel")
                    .setStyle(ButtonStyle.Inline)
                    .onClick(() => sheet.close()),
                Button("Hard Restart")
                    .setColor(Color.Critical)
                    .onPromiseClick(async () => {
                        await API.hosting.serverId(serverId).forcerestart()
                            .then(stupidErrorAlert);
                        location.reload();
                    })
            )
                .setGap(".5rem")
                .setJustify("end")
                .setRawColumns("auto max-content")
        ).setGap()
    );
    return sheet;
};
