import { lazyInit, State } from "webgen/mod.ts";
import { API } from "../shared/restSpec.ts";
import { createStableWebSocket } from "webgen/network.ts";

export const data = State({
    stats: {
        users: 0,
        drops: 0,
        servers: 0
    }
});

export const streamingPool = lazyInit(async () => {
    await createStableWebSocket({
        url: API.WS_URL.replace("/ws", "/api/@bbn/public/stats")
    }, {
        onMessage: (msg) => {
            if(typeof msg !== "string") return;
            const json = JSON.parse(msg)
            data.stats = State(json as typeof data.stats);
        }
    });
});