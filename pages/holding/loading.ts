import { API } from "shared/restSpec.ts";
import { createStableWebSocket } from "webgen/extended.ts";
import { asState, lazy } from "webgen/mod.ts";

export const data = asState({
    stats: {
        users: 0,
        drops: 0,
        servers: 0,
    },
});

export const streamingPool = lazy(async () => {
    await createStableWebSocket({
        url: API.WS_URL.replace("/ws", "/api/@bbn/public/stats"),
    }, {
        onMessage: (msg) => {
            if (typeof msg !== "string") return;
            const json = JSON.parse(msg);
            data.stats = asState(json as typeof data.stats);
        },
    });
});
