import { API, LoadingSpinner } from "shared/mod.ts";
import { Box, Color, Component, IconButton, MIcon, StateHandler, isMobile } from "webgen/mod.ts";
import { Server, SidecarResponse } from "../../../spec/music.ts";
import { messageQueueSidecar, startSidecarConnection } from "../loading.ts";
import { StateActions } from "../types.ts";

export function ChangeStateButton(server: StateHandler<Server>): Component {
    return server.$state.map((state) => ((<StateActions>{
        "offline": IconButton(MIcon("play_arrow"), "delete")
            .addClass("color-green")
            .setColor(Color.Colored)
            .onClick((e) => {
                e.stopPropagation();
                API.hosting.serverId(server._id).start();
                startSidecarConnection(server._id);
                const promise = Promise.withResolvers<SidecarResponse>();
                messageQueueSidecar.push({
                    request: {
                        type: "state",
                        state: "start"
                    },
                    response: promise // Maybe we can use this to show a different loading spinner until the server is starting
                });
            }),
        // TODO: make this better (labels or something)
        "installing": LoadingSpinner(),
        "stopping": LoadingSpinner(),
        "starting": LoadingSpinner(),
        "running": IconButton(MIcon("stop"), "delete")
            .setColor(Color.Critical)
            .onClick((e) => {
                e.stopPropagation();
                server.state = "stopping";
                startSidecarConnection(server._id);
                const promise = Promise.withResolvers<SidecarResponse>();
                messageQueueSidecar.push({
                    request: {
                        type: "state",
                        state: "stop"
                    },
                    response: promise
                });
            })
    })[ state ] ?? Box()))
        .asRefComponent()
        .addClass(isMobile.map(it => it ? "small" : "normal"), "icon-buttons-list", "action-list");
}
