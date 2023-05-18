import { State } from "webgen/mod.ts";
import { state } from "./data.ts";
import { API } from "../manager/RESTSpec.ts";

export async function refreshState() {
    state.servers = State((await API.hosting(API.getToken()).servers()).map(x => State(x)));
    await API.hosting(API.getToken()).meta();
}

export function pulling() {
    setInterval(async () => {
        // Pull every two seconds
        const current = await API.hosting(API.getToken()).servers();
        for (const remote of current) {
            const index = state.servers.findIndex(x => x._id == remote._id);
            if (index == -1)
                state.servers.splice(current.indexOf(remote), 0, State(remote));
            else
                for (const [ key, value ] of Object.entries(remote)) {
                    state.servers[ index ][ key ] = value;
                }
        }
    }, 2000);
}