import { lazyInit, State } from "webgen/mod.ts";
import { API } from "../shared/restSpec.ts";

export const data = State({
    stats: {
        users: 0,
        drops: 0,
        servers: 0
    }
});

// deno-lint-ignore require-await
export const streamingPool = lazyInit(async () => {
    function connect() {
        const ws = new WebSocket(API.WS_URL.replace("/ws", "/api/@bbn/public/stats"));

        ws.onmessage = ({ data: msg }) => {
            const json = JSON.parse(msg);
            data.stats = State(json as typeof data.stats);
        };
        ws.onerror = () => {

        };
        ws.onclose = () => setTimeout(() => connect(), 1000);

    }
    connect();
});