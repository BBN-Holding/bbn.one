import { API } from "./RESTSpec.ts";

export type StreamingUploadEvents = {
    credentials: () => string,
    prepare: () => void,
    onUploadTick: (percentage: number) => Promise<void>,
    uploadDone: () => void,
    backendResponse: (id: string) => void
}

export function StreamingUploadHandler(events: StreamingUploadEvents, dropId: string, file: File) {
    try {
        events.prepare();
        const ws = new WebSocket(`${API.BASE_URL.replace("https", "wss").replace("http", "ws")}music/${dropId}/upload`);
        let bytesUploaded = 0;
        const stream = file
            .stream()
            .pipeThrough(new TransformStream({
                async transform(chunk, controller) {
                    bytesUploaded += chunk.length;
                    const percentage = (bytesUploaded / file.size) * 100;
                    await events.onUploadTick(percentage);
                    controller.enqueue(chunk);
                }
            }));
        ws.onopen = () => {
            ws.send(events.credentials());
        }
        const reader = stream.getReader();

        ws.onmessage = async ({ data }) => {
            if (data == "next") {
                const read = await reader.read()
                console.log(read.value);
                if (read.value)
                    ws.send(read.value);
                if (read.done) {
                    ws.send("end");
                    events.uploadDone();
                }
            } else {
                reader.releaseLock();
                events.backendResponse(JSON.parse(data).id);
            }
        }
        // await write(writable, "end");
        // const reader = readable.getReader();
        // const { id } = JSON.parse((await reader.read()).value as string);
        // reader.releaseLock();

    } catch (error) {
        console.error(error);
        alert("There was an Error Uploading your files...\n\nPlease try again later");
    }
}