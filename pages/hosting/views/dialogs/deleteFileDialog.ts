import { Box, Button, Color, Grid, Label, SheetDialog, Vertical } from "webgen/mod.ts";
import { sheetStack } from "../../../_legacy/helper.ts";

export function deleteFileDialog() {
    const response = Promise.withResolvers<boolean>();
    const dialog = SheetDialog(sheetStack, "Are you sure?",
        Vertical(
            Box(Label("Deleting this File will result in data loss.\nAfter this point there is no going back.")).setMargin("0 0 1.5rem")),
        Grid(
            Button("Cancel").onClick(() => dialog.close()),
            Button("Delete").onClick(() => {
                response.resolve(true);
                dialog.close();
            }).setColor(Color.Critical)
        )
            .setGap(".5rem")
            .setJustify("end")
            .setRawColumns("auto max-content")
    );

    dialog.setOnClose(() => response.resolve(false));

    dialog.open();

    return response.promise;
}
