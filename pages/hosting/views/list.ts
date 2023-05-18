import { Box, Color, CommonIconType, Dialog, Grid, Horizontal, IconButton, MaterialIcons, PlainText, Reactive, MediaQuery, Entry, TextInput, DropDownInput, Vertical, Component, IconButtonComponent, State, CenterV } from "webgen/mod.ts";
import { state } from "../data.ts";
import './list.css';
import { API } from "../../manager/RESTSpec.ts";
import { refreshState } from "../loading.ts";
import locations from "../../../data/locations.json" assert { type: "json" };
import servers from "../../../data/eggs.json" assert { type: "json" };
import { PowerState } from "../../../spec/music.ts";
import { LoadingSpinner } from "../../shared/components.ts";

new MaterialIcons();

type StateActions = {
    [ type in PowerState ]: Component | IconButtonComponent;
};

export const listView = MediaQuery("(max-width: 700px)", (small) => Reactive(state, "servers", () => Grid(
    ...state.servers.map(server => Entry({
        title: server.name,
        subtitle: `${servers[ server.type ].name} @ ${locations[ server.location ]}`
    })
        .addPrefix(Reactive(server, "state", () => Box().addClass("dot", server.state)).removeFromLayout())
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
                Reactive(server, "state", () => ((<StateActions>{
                    "offline": IconButton("play_arrow", "delete")
                        .addClass("color-green")
                        .setColor(Color.Colored)
                        .onClick(async () => {
                            await API.hosting(API.getToken()).serverId(server._id).power("start");
                            // This actually works when we a have better change stream system
                            server.state = "starting";
                        }),
                    // TODO: make this better (labels or something)
                    "installing": LoadingSpinner(),
                    "stopping": LoadingSpinner(),
                    "starting": LoadingSpinner(),
                    "running": IconButton("stop", "delete")
                        .setColor(Color.Critical)
                        .onClick(async () => {
                            server.loading = true;
                            await API.hosting(API.getToken()).serverId(server._id).power("stop");
                        })
                })[ server.state ] ?? Box())).addClass("action-list").removeFromLayout()
            )
                .setGap(small ? ".5rem" : "1rem")
                .addClass("icon-buttons-list", small ? "small" : "normal")
        )
        .setPadding("1.6rem")
        .addClass(small ? "small" : "normal")
    ),
    ...[ ExplainerText() ].filter(x => x) as Component[]
).setGap("var(--gap)").addClass("limited-width")));

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

export function ExplainerText() {
    return state.servers.length == 0 ?
        Vertical(
            PlainText("No Servers")
                .addClass("list-title")
                .setMargin("0"),
            PlainText("Welcome! Create a server to get going. 🤖🛠️") ,
        ).setGap("1rem")
        : null;
}