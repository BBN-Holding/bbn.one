import { HmRequest, LoginRequest, MessageType, SyncResponse, TriggerRequest } from "https://deno.land/x/hmsys_connector@0.9.0/mod.ts";
import { API, ProgressTracker, stupidErrorAlert } from "shared";
import { Deferred, deferred } from "std/async/deferred.ts";
import { decodeBase64, encodeBase64 } from "std/encoding/base64.ts";
import { Pointer, State, asPointer, lazyInit } from "webgen/mod.ts";
import { Server, ServerDetails, SidecarRequest, SidecarResponse } from "../../spec/music.ts";
import { activeUser, tokens } from "../_legacy/helper.ts";
import { state } from "./data.ts";
import { canWriteInFolder, currentFiles } from "./views/state.ts";


export async function refreshState() {
    state.servers = State((await API.hosting.servers()).map(x => State(x)));
    const server = await API.hosting.serverId("64667d43cd05eda8384c6481").get().then(stupidErrorAlert);
    if (!state.servers.find(it => it._id == "64667d43cd05eda8384c6481"))
        state.servers.push(State(server));
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
    ws.onmessage = (event: MessageEvent<string>) => {
        const msg = <SidecarResponse>JSON.parse(event.data);
        for (const iterator of syncedResponses) {
            if (
                (
                    (iterator.request.type === "write" && (msg.type === "next-chunk" || msg.type === "error")) ||
                    (iterator.request.type === "read" && (msg.type === "read" || msg.type === "error")) ||
                    (iterator.request.type === "next-chunk" && (msg.type === "read" || msg.type === "error")) ||
                    (iterator.request.type === "list" && msg.type === "list")
                )
                && iterator.request.path == msg.path
            ) {
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
        isSidecarConnect.setValue(true);
    };

    ws.onclose = () => {
        clearInterval(watcher);
        if (!activeSideCar) return;
        activeSideCar = undefined;
        isSidecarConnect.setValue(false);
        startSidecarConnection(id);
    };
    await activeSideCar;
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
    if (data.type == "list") {
        canWriteInFolder.setValue(data.canWrite);
        currentFiles.setValue(data.list);
    }
}
export function downloadFile(path: string) {
    let firstTime = true;
    return new ReadableStream<Uint8Array>({
        pull: async (controller) => {
            const nextChunk = deferred<SidecarResponse>();
            messageQueueSidecar.push({
                request: {
                    type: firstTime ? "read" : "next-chunk",
                    path: path
                },
                response: nextChunk
            });
            const response = await nextChunk;
            if (response.type === "error") {
                controller.error(response.error);
                return;
            }
            if (response.type === "read" && response.chunk) {
                controller.enqueue(decodeBase64(response.chunk));
            }
            if (response.type === "read" && response.finish) {
                controller.close();
            }
            firstTime = false;
        }
    });
}
export async function uploadFile(_path: string, file: File, progress: Pointer<number>) {
    const check = deferred<SidecarResponse>();
    messageQueueSidecar.push({
        request: {
            type: "write",
            path: _path
        },
        response: check
    });
    await check;

    const stream = file.stream()
        .pipeThrough(ProgressTracker(progress, file.size));
    for await (const iterator of stream) {
        const nextChunk = deferred<SidecarResponse>();
        messageQueueSidecar.push({
            request: {
                type: "write",
                path: _path,
                chunk: encodeBase64(iterator)
            },
            response: nextChunk
        });
        await nextChunk;
    }
    progress.setValue(100);
}