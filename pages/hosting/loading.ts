import { State } from "webgen/mod.ts";
import { state } from "./data.ts";
import { API } from "../manager/RESTSpec.ts";
import { LoginRequest, MessageType, PublishResponse, SubscribeRequest } from "https://deno.land/x/hmsys_connector@0.9.0/mod.ts";
import { activeUser, tokens } from "../manager/helper.ts";
import { Server } from "../../spec/music.ts";

export async function refreshState() {
    state.servers = State((await API.hosting(API.getToken()).servers()).map(x => State(x)));
    state.meta = State(await API.hosting(API.getToken()).meta());
}

/**
 * me waiting for hmsys_connector@0.10 to fix this bloat code down under
 */
export function listener() {
    const ws = new WebSocket(API.WS_URL);
    let firstTime = true;
    console.log("Starting Update Listener...");
    ws.onmessage = ({ data }) => {
        const json = JSON.parse(data);
        if (json.login === "require authentication") {
            tokens.$accessToken.on((val) => val && ws.send(JSON.stringify(<LoginRequest>{
                action: MessageType.Login,
                type: "client",
                token: API.getToken(),
                id: activeUser.id
            })));
        }
        if (json.login === true && firstTime === true) {
            firstTime = false;
            ws.send(JSON.stringify(<SubscribeRequest>{
                action: "sub",
                id: "@bbn/hosting/sync",
                auth: {
                    token: API.getToken(),
                    id: activeUser.id
                }
            }));
        }
        if (json.type == "pub") {
            const { data: { id, server: _server } } = <PublishResponse>json;
            const server = JSON.parse(_server) as Server;
            console.log(id, server);
            const index = state.servers.findIndex(x => x._id == server._id);
            if (index === -1) return; // handle this state
            for (const [ key, value ] of Object.entries(server)) {
                // @ts-ignore unsafe af
                state.servers[ index ][ key ] = value;
            }
        }
    };
    // my fancy reconnect
    ws.onclose = () => setTimeout(() => listener(), 1000);
}