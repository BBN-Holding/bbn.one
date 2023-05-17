import { Box, Color, CommonIconType, Dialog, Grid, Horizontal, IconButton, MaterialIcons, PlainText, Reactive, MediaQuery, Entry } from "webgen/mod.ts";
import { state } from "../data.ts";
import './list.css';
import { API } from "../../manager/RESTSpec.ts";
import { refreshState } from "../loading.ts";
import locations from "../../../data/locations.json" assert { type: "json" };
import servers from "../../../data/eggs.json" assert { type: "json" };

new MaterialIcons();

export const listView = MediaQuery("(max-width: 700px)", (small) => Reactive(state, "servers", () => Grid(
    ...state.servers.map(server => Entry({
        title: server.name,
        subtitle: `${servers[ server.type ].name} @ ${locations[ server.location ]} @ ${server.state}`
    })
        .addSuffix(
            Horizontal(
                IconButton("dashboard", "dashboard")
                    .onClick(async () => {
                        alert(JSON.stringify(await API.hosting(API.getToken()).serverId(server._id).get()));
                    }),
                IconButton(CommonIconType.Edit, "edit"),
                IconButton(CommonIconType.Delete, "delete")
                    .setColor(Color.Critical)
                    .onClick(() => {
                        deleteServer(server._id);
                    })
            )
                .setGap(small ? ".5rem" : "1rem")
                .addClass("icon-buttons-list", small ? "small" : "normal")
        )
        .setPadding("1.6rem")
        .addClass("limited-width", small ? "small" : "normal")
    )
).setGap("var(--gap)")));

function deleteServer(serverId: string) {
    Dialog(() => Box(PlainText("Deleting this Server, will result in data loss.\nAfter this point there is no going back.")).setMargin("0 0 1.5rem"))
        .setTitle("Are you sure?")
        .addButton("Cancel", "remove")
        .addButton("Delete", async () => {
            try {
                await API.hosting(API.getToken()).serverId(serverId).delete();
            } catch (error) {
                alert(JSON.stringify(error));
            }
            await refreshState();
            return "remove" as const;
        }, Color.Critical)
        .allowUserClose()
        .open();
}