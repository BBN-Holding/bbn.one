import { Box, Color, CommonIconType, Dialog, Grid, Horizontal, IconButton, MaterialIcons, PlainText, Reactive, MediaQuery, Entry, TextInput, DropDownInput, Vertical, Component, IconButtonComponent } from "webgen/mod.ts";
import { state } from "../data.ts";
import './list.css';
import { API } from "../../manager/RESTSpec.ts";
import { refreshState } from "../loading.ts";
import locations from "../../../data/locations.json" assert { type: "json" };
import servers from "../../../data/eggs.json" assert { type: "json" };
import { PowerState } from "../../../spec/music.ts";
import { LoadingSpinner } from "../../shared/components.ts";
import { serve } from "https://deno.land/std@0.182.0/http/server.ts";

new MaterialIcons();

type StateActions = {
    [ type in PowerState ]: Component | IconButtonComponent;
};

export const listView = MediaQuery("(max-width: 700px)", (small) => Reactive(state, "servers", () => Grid(
    ...state.servers.map(server => Entry({
        title: server.name,
        subtitle: `${servers[ server.type ].name} @ ${locations[ server.location ]} @ ${server.state}`
    })
        .addSuffix(
            Horizontal(
                IconButton("dashboard", "dashboard")
                    .onClick(async () => {
                        const thing = await API.hosting(API.getToken()).serverId(server._id).get();
                        location.href = `https://panel.mc4u.xyz/server/${thing.ptero.identifier}`;
                    }),
                IconButton(CommonIconType.Edit, "edit")
                    .onClick(() => {
                        Dialog(() =>
                            Vertical(
                                PlainText(`A ${servers[ server.type ].name} Server.`),
                                Grid(
                                    [
                                        {
                                            width: 2
                                        },
                                        TextInput("text", "Friendly Name")
                                            .setColor(Color.Disabled)
                                            .sync(server, "name")
                                    ],
                                    DropDownInput("Location", Object.keys(locations))
                                        .setColor(Color.Disabled)
                                        .setRender(location => locations[ location as keyof typeof locations ])
                                        .sync(server, "location")
                                )
                                    .setGap("var(--gap)")
                                    .setEvenColumns(2)
                            )
                                .setGap("var(--gap)")
                        )
                            .setTitle(server.name)
                            .allowUserClose()
                            .addButton("Delete Server", () => {
                                deleteServer(server._id);
                                return "remove";
                            }, Color.Critical)
                            .addButton("Close", "remove")
                            .addButton("Save", "remove")
                            .open();

                    }),
                Reactive(server, "loading", () => server.loading
                    ? LoadingSpinner()
                    : ((<StateActions>{
                        "stop": IconButton("play_arrow", "delete")
                            .addClass("color-green")
                            .setColor(Color.Colored)
                            .onClick(async () => {
                                server.loading = true;
                                await API.hosting(API.getToken()).serverId(server._id).power("start");
                            }),
                        "start": IconButton("pause", "delete")
                            .setColor(Color.Critical)
                            .onClick(async () => {
                                server.loading = true;
                                await API.hosting(API.getToken()).serverId(server._id).power("stop");
                            })
                    })[ server.state ] ?? null)
                ).removeFromLayout()
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