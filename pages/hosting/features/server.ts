import { Box, Card, CenterV, Color, CommonIconType, Dialog, Grid, Horizontal, IconButton, MaterialIcons, PlainText, Reactive, Spacer, Vertical } from "webgen/mod.ts";
import { state } from "../data.ts";
import './server.css';

new MaterialIcons();

export const serverView = Reactive(state, "servers", () => Grid(
    ...state.servers.map(server => Card(Horizontal(
        Vertical(
            PlainText(server.name)
                .setFont(36 / 16, 700)
                .addClass("title-server"),
            PlainText(`${server.server} @ ${server.location}`)
                .setFont(1, 700)
                .addClass("gray-color", "same-height")
        ).setGap("17px"),
        Spacer(),
        CenterV(Horizontal(
            IconButton("dashboard", "dashboard"),
            IconButton(CommonIconType.Edit, "edit"),
            IconButton(CommonIconType.Delete, "delete")
                .setColor(Color.Critical)
                .onClick(() => {
                    deleteServer(server.id);
                })
        ).setGap("1rem").addClass("icon-buttons-list"))

    )).setPadding("1.6rem").addClass("list-entry", "limited-width")
    )
));

function deleteServer(serverId: string) {
    Dialog(() => Box(PlainText("Deleting this Server, will result in data loss.\nAfter this point there is no going back.")).setMargin("0 0 1.5rem"))
        .setTitle("Are you sure?")
        .addButton("Cancel", "remove")
        .addButton("Delete", () => {
            alert("Not yet impl. serverId:" + serverId);
            return "remove";
        }, Color.Critical)
        .allowUserClose()
        .open();
}