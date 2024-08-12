import { API, stupidErrorAlert } from "shared/restSpec.ts";
import { Button, ButtonStyle, Color, Grid, Label, SheetDialog } from "webgen/mod.ts";
import { sheetStack } from "../../shared/helper.ts";

export const deleteServerDialog = (serverId: string) => {
    const sheet = SheetDialog(
        sheetStack,
        "Delete Server",
        Grid(
            Label("Deleting this Server will result in data loss.\nAfter this point there is no going back."),
            Grid(
                Button("Cancel")
                    .setStyle(ButtonStyle.Inline)
                    .onClick(() => sheet.close()),
                Button("Delete").setColor(Color.Critical).onPromiseClick(async () => {
                    await API.hosting.serverId(serverId).delete()
                        .then(stupidErrorAlert);
                    location.href = "/hosting";
                }),
            )
                .setGap(".5rem")
                .setJustifyItems("end")
                .setRawColumns("auto max-content"),
        ).setGap(),
    );
    return sheet;
};
