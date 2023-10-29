import { HmRequest, LoginRequest, MessageType, SyncResponse, TriggerRequest } from "https://deno.land/x/hmsys_connector@0.9.0/mod.ts";
import { API } from "shared";
import { Deferred, deferred } from "std/async/deferred.ts";
import { encodeBase64 } from "std/encoding/base64.ts";
import { State, asPointer, lazyInit } from "webgen/mod.ts";
import { Server, ServerDetails, SidecarRequest, SidecarResponse } from "../../spec/music.ts";
import { activeUser, tokens } from "../_legacy/helper.ts";
import { state } from "./data.ts";

export async function refreshState() {
    state.servers = State((await API.hosting.servers()).map(x => State(x)));
    state.meta = State(await API.hosting.meta());
}

/**
 * me waiting for hmsys_connector@0.10 to fix this bloat code down under
 *
 * TODO: Move this the the pool down below
 */
export function listener() {
    const ws = new WebSocket(API.WS_URL);
    let firstTime = true;
    ws.onmessage = ({ data }) => {
        const json = JSON.parse(data);
        if (json.login === "require authentication") {
            tokens.$accessToken.listen((val) => val && ws.send(JSON.stringify(<LoginRequest>{
                action: MessageType.Login,
                type: "client",
                token: API.getToken(),
                id: activeUser.id
            })));
        }
        if (json.login === true && firstTime === true) {
            firstTime = false;
            ws.send(JSON.stringify(<TriggerRequest>{
                action: "trigger",
                type: "@bbn/hosting/list",
                auth: {
                    token: API.getToken(),
                    id: activeUser.id
                },
                data: {
                    id: activeUser.id
                }
            }));
        }
        if (json.type !== "sync") {
            return;
        }
        const { data: { servers: _servers } } = <SyncResponse>json.data;
        const servers = JSON.parse(_servers) as Server[];
        for (const server of servers) {
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

export const currentDetailsTarget = asPointer(<string | undefined>undefined);
export const currentDetailsSource = asPointer((_data: ServerDetails) => { });

export const messageQueue = <HmRequest[]>[];
// deno-lint-ignore require-await
export const streamingPool = lazyInit(async () => {
    function connect() {
        const ws = new WebSocket(API.WS_URL);
        let firstTime = true;
        ws.onmessage = ({ data }) => {
            const json = JSON.parse(data);

            if (json.login === "require authentication" && tokens.accessToken) ws.send(JSON.stringify(<LoginRequest>{
                action: MessageType.Login,
                type: "client",
                token: API.getToken(),
                id: activeUser.id
            }));

            if (json.login === true && firstTime === true) {
                firstTime = false;
                currentDetailsTarget.listen((id, _oldId) => {
                    if (id)
                        ws.send(JSON.stringify(<TriggerRequest>{
                            action: MessageType.Trigger,
                            type: "@bbn/hosting/details",
                            data: {
                                id
                            },
                            auth: {
                                token: API.getToken(),
                                id: activeUser.id
                            }
                        }));
                    else if (_oldId != undefined) {
                        // Else somehow unregister the oldId
                        // Can't current unregister the conversation. Thats why we just restart the pool.
                        ws.close();
                    }

                });
            }
            if (json.type == "sync" && json.data.type == "@bbn/hosting/details") {
                currentDetailsSource.getValue()?.(json.data.data);
            }
        };
        ws.onerror = () => {

        };
        setInterval(() => {
            if (ws.readyState != ws.OPEN || messageQueue.length == 0) return;

            ws.send(JSON.stringify(messageQueue.shift()));
        }, 100);
        ws.onclose = () => setTimeout(() => connect(), 1000);
    }
    connect();
});

export type RemotePath = {
    name: string;
    size?: string;
    lastModified?: number;
    fileMimeType?: string;
    uploadingRatio?: string;
};

export const currentFiles = asPointer(<RemotePath[]>[]);
export const currentPath = asPointer("/");
export let messageQueueSidecar = <{ request: SidecarRequest, response: Deferred<SidecarResponse>; }[]>[];
let activeSideCar: Deferred<void> | undefined = undefined;
export const isSidecarConnect = asPointer(false);
export const sidecarDetailsSource = asPointer((_data: SidecarResponse | "clear") => { });
export function stopSidecarConnection() {
    activeSideCar?.resolve();
}
export async function startSidecarConnection(id: string) {
    if (activeSideCar) {
        messageQueueSidecar = [];
        activeSideCar.resolve();
    }

    const url = new URL(`wss://bbn.one/api/@bbn/sidecar/${id}/ws`);
    url.searchParams.set("TOKEN", localStorage[ "access-token" ]);
    const ws = new WebSocket(url.toString());
    activeSideCar = deferred();

    const syncedResponses = new Set<{ request: SidecarRequest, response: Deferred<SidecarResponse>; }>();

    let watcher = 0;
    let stats = 0;
    ws.onmessage = (event: MessageEvent<string>) => {
        const msg = <SidecarResponse>JSON.parse(event.data);
        for (const iterator of syncedResponses) {
            if (((iterator.request.type === "write" && (msg.type === "next-chunk" || msg.type === "error")) || (iterator.request.type === "list" && msg.type === "list")) && iterator.request.path == msg.path) {
                syncedResponses.delete(iterator);
                iterator.response.resolve(msg);
                break;
            }
        }
        if (msg.type === "state") {
            const index = state.servers.findIndex(x => x._id == id);
            if (index === -1) return; // handle this state
            state.servers[ index ].state = msg.state;
        }
        sidecarDetailsSource.getValue()?.(msg);
    };
    ws.onopen = () => {
        watcher = setInterval(() => {
            if (ws.readyState != ws.OPEN || messageQueueSidecar.length == 0) return;
            const msg = messageQueueSidecar.shift()!;
            syncedResponses.add(msg);
            ws.send(JSON.stringify(msg.request));
        }, 100);
        sidecarDetailsSource.getValue()?.("clear");
        isSidecarConnect.setValue(true);
    };

    ws.onclose = () => {
        clearInterval(watcher);
        clearInterval(stats);
        if (!activeSideCar) return;
        isSidecarConnect.setValue(false);
        startSidecarConnection(id);
    };
    await activeSideCar;
    activeSideCar = undefined;
    ws.close();
}

export async function listFiles(_path: string) {
    const response = deferred<SidecarResponse>();
    messageQueueSidecar.push({
        request: {
            type: "list",
            path: _path
        },
        response
    });

    const data = await response;
    if (data.type == "list")
        currentFiles.setValue(data.list);
}

export async function uploadFile(_path: string, file: File, progress: (ratio: number) => void) {
    const check = deferred<SidecarResponse>();
    messageQueueSidecar.push({
        request: {
            type: "write",
            path: _path
        },
        response: check
    });
    await check;
    progress(0);
    for await (const iterator of file.stream()) {
        const nextChunk = deferred<SidecarResponse>();
        messageQueueSidecar.push({
            request: {
                type: "write",
                path: _path,
                chunk: encodeBase64(iterator)
            },
            response: nextChunk
        });
        const rsp = await nextChunk;
        console.log(rsp);
        // TODO: Add progress
    }
    progress(1);
}