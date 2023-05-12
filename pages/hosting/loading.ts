import { State } from "webgen/mod.ts";
import { state } from "./data.ts";
import { API } from "../manager/RESTSpec.ts";

export async function refreshState() {
    state.servers = State(await API.hosting(API.getToken()).servers());
}
