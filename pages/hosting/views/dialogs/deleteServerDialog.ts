import { API, stupidErrorAlert } from "shared/restSpec.ts";
import { Button, Color, Grid, Label, Sheet } from "webgen/mod.ts";
import { hostingSheets } from "../../main.ts";

export function deleteServerDialog(serverId: string) {
    const sheet = Sheet(
        Grid(
            Label("Delete Server").setTextSize("2xl").setFontWeight("bold"),
            Label("Deleting this Server will result in data loss.\nAfter this point there is no going back."),
            Grid(
                Label("Are you sure?"),
                Grid(
                    Button("Cancel").onClick(() => hostingSheets.remove(sheet)),
                    Button("Delete").setColor(Color.Critical).onClick(async () => {
                        await API.hosting.serverId(serverId).delete()
                            .then(stupidErrorAlert);
                        location.href = "/hosting";
                    })
                ).setGap("2rem").setEvenColumns(2)
            ).setGap("1rem")
        ).setGap().setMargin("1.5rem")
    );
    hostingSheets.add(sheet);
}
