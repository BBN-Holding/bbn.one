import { decodeBase64, encodeBase64 } from "@std/encoding";
import { LoginRequest, MessageType, SyncResponse, TriggerRequest } from "https://deno.land/x/hmsys_connector@0.9.0/mod.ts";
import { API, ProgressTracker } from "shared/mod.ts";
import { createStableWebSocket } from "webgen/extended/mod.ts";
import { asRef, asState, lazy, Reference } from "webgen/mod.ts";
import { Deferred, InstalledAddon, Server, SidecarRequest, SidecarResponse } from "../../spec/music.ts";
import { activeUser, tokens } from "../shared/helper.ts";
import { state } from "./data.ts";
import { canWriteInFolder, currentFiles } from "./views/state.ts";

export async function refreshState() {
    state.servers = asState(await API.hosting.servers());
    state.meta = asState(await API.hosting.meta());
}

/**
 * me waiting for hmsys_connector@0.10 to fix this bloat code down under
 *
 * TODO: Move this the the pool down below
 */
export const liveUpdates = lazy(async () => {
    let firstTime = true;
    const connection = await createStableWebSocket({
        url: API.WS_URL,
    }, {
        onReconnect: () => {
            firstTime = true;
        },
        onMessage: (msg) => {
            if (typeof msg !== "string") return;
            const json = JSON.parse(msg);
            if (json.login === "require authentication") {
                tokens.$accessToken.listen((val) =>
                    val && connection.send(JSON.stringify(
                        <LoginRequest> {
                            action: MessageType.Login,
                            type: "client",
                            token: API.getToken(),
                            id: activeUser.id,
                        },
                    ))
                );
            }
            if (json.login === true && firstTime === true) {
                firstTime = false;
                connection.send(JSON.stringify(
                    <TriggerRequest> {
                        action: "trigger",
                        type: "@bbn/hosting/list",
                        auth: {
                            token: API.getToken(),
                            id: activeUser.id,
                        },
                        data: {
                            id: activeUser.id,
                        },
                    },
                ));
            }
            if (json.type !== "sync") {
                return;
            }
            const { data: { servers: _servers } } = <SyncResponse> json.data;
            const servers = JSON.parse(_servers) as Server[];
            for (const server of servers) {
                const index = state.servers.findIndex((x) => x._id == server._id);
                if (index === -1) return; // handle this state
                for (const [key, value] of Object.entries(server)) {
                    // @ts-ignore unsafe af
                    state.servers[index][key] = value;
                }
            }
        },
    });
});

export let messageQueueSidecar = <{ request: SidecarRequest; response: Deferred<SidecarResponse> }[]> [];
export const isSidecarConnect = asRef(false);
export const sidecarDetailsSource = asRef((_data: SidecarResponse | "clear") => {});
export let closeSignal = Promise.withResolvers<void>();

export function stopSidecarConnection() {
    closeSignal.resolve();
}

export async function startSidecarConnection(id: string) {
    // Reset Global Variables
    closeSignal = Promise.withResolvers<void>();
    messageQueueSidecar = [];

    // Prepare Connection
    const url = new URL(`wss://bbn.one/api/@bbn/sidecar/${id}/ws`);
    url.searchParams.set("TOKEN", API.getToken());
    const syncedResponses = new Set<{ request: SidecarRequest; response: Deferred<SidecarResponse> }>();

    // Start Conneciton
    const connection = await createStableWebSocket({
        url: url.toString(),
    }, {
        onMessage: (event) => {
            if (typeof event !== "string") return;
            const msg = <SidecarResponse> JSON.parse(event);
            for (const iterator of syncedResponses) {
                if (
                    (iterator.request.type === "uninstall-addon" && (msg.type === "uninstall-addon" || msg.type === "error")) ||
                    (iterator.request.type === "install-addons" && (msg.type === "install-addons" || msg.type === "error")) ||
                    (iterator.request.type === "installed-addons" && (msg.type === "installed-addons" || msg.type === "error")) ||
                    (
                        (
                            (iterator.request.type === "write" && (msg.type === "next-chunk" || msg.type === "error")) ||
                            (iterator.request.type === "read" && (msg.type === "read" || msg.type === "error")) ||
                            (iterator.request.type === "next-chunk" && (msg.type === "read" || msg.type === "error")) ||
                            (iterator.request.type === "list" && msg.type === "list")
                        ) &&
                        iterator.request.path == msg.path
                    )
                ) {
                    syncedResponses.delete(iterator);
                    iterator.response.resolve(msg);
                    break;
                }
            }
            if (msg.type === "state") {
                const index = state.servers.findIndex((x) => x._id == id);
                if (index === -1) return; // handle this state
                state.servers[index].state = msg.state;
            }
            sidecarDetailsSource.getValue()?.(msg);
        },
    });
    // Stable WebSocket Connection
    const watcher = setInterval(() => {
        if (messageQueueSidecar.length == 0) return;
        const msg = messageQueueSidecar.shift()!;
        syncedResponses.add(msg);
        connection.send(JSON.stringify(msg.request));
    }, 100);
    isSidecarConnect.setValue(true);

    // User wants to Disconnect
    await closeSignal.promise;
    connection.close();
    isSidecarConnect.setValue(false);
    clearInterval(watcher);
}

export async function listFiles(path: string) {
    const response = Promise.withResolvers<SidecarResponse>();
    messageQueueSidecar.push({
        request: {
            type: "list",
            path,
        },
        response,
    });

    const data = await response.promise;
    if (data.type == "list") {
        canWriteInFolder.setValue(data.canWrite);
        currentFiles.setValue(data.list);
    }
}
export function downloadFile(path: string) {
    let firstTime = true;
    return new ReadableStream<Uint8Array>({
        pull: async (controller) => {
            const nextChunk = Promise.withResolvers<SidecarResponse>();
            messageQueueSidecar.push({
                request: {
                    type: firstTime ? "read" : "next-chunk",
                    path,
                },
                response: nextChunk,
            });
            const response = await nextChunk.promise;
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
        },
    });
}
export async function uploadFile(path: string, file: File, progress: Reference<number>) {
    const check = Promise.withResolvers<SidecarResponse>();
    messageQueueSidecar.push({
        request: {
            type: "write",
            path,
        },
        response: check,
    });
    await check.promise;

    const stream = file.stream()
        .pipeThrough(ProgressTracker(progress, file.size));
    for await (const iterator of stream) {
        const nextChunk = Promise.withResolvers<SidecarResponse>();
        messageQueueSidecar.push({
            request: {
                type: "write",
                path,
                chunk: encodeBase64(iterator),
            },
            response: nextChunk,
        });
        await nextChunk.promise;
    }
    progress.setValue(100);
}

export async function installAddon(addons: InstalledAddon[]) {
    const response = Promise.withResolvers<SidecarResponse>();
    messageQueueSidecar.push({
        request: {
            type: "install-addons",
            addons,
        },
        response,
    });

    const data = await response.promise;
    if (data.type == "install-addons") {
        return data.success;
    }
    return false;
}

export async function uninstallAddon(projectId: string) {
    const response = Promise.withResolvers<SidecarResponse>();
    messageQueueSidecar.push({
        request: {
            type: "uninstall-addon",
            projectId,
        },
        response,
    });

    const data = await response.promise;
    if (data.type == "uninstall-addon") {
        return data.success;
    }
    return false;
}

export async function getInstalledAddons(): Promise<{ addon: InstalledAddon; dependencies: InstalledAddon[] }[]> {
    const response = Promise.withResolvers<SidecarResponse>();
    messageQueueSidecar.push({
        request: {
            type: "installed-addons",
        },
        response,
    });

    const data = await response.promise;
    if (data.type == "installed-addons") {
        return data.addons;
    }
    return [];
}
