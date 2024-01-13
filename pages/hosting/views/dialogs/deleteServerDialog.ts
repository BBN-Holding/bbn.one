import { API, stupidErrorAlert } from "shared/restSpec.ts";
import { Button, Color, Grid, Label, SheetDialog } from "webgen/mod.ts";
import { sheetStack } from "../../../_legacy/helper.ts";

export const deleteServerDialog = (serverId: string) => {
    const sheet = SheetDialog(sheetStack, "Delete Server",
        Grid(
            Label("Deleting this Server will result in data loss.\nAfter this point there is no going back."),
            Grid(
                Label("Are you sure?"),
                Grid(
                    Button("Cancel").onClick(() => sheet.close()),
                    Button("Delete").setColor(Color.Critical).onClick(async () => {
                        await API.hosting.serverId(serverId).delete()
                            .then(stupidErrorAlert);
                        location.href = "/hosting";
                    })
                ).setGap("2rem").setEvenColumns(2)
            ).setGap("1rem")
        ).setGap().setMargin("1.5rem")
    );
    return sheet;
};
