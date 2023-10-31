import { API } from "shared";
import { Pointer, asPointer, createElement } from "webgen/mod.ts";

export type StreamingUploadEvents = {
    credentials: () => string,
    onUploadTick: (percentage: number) => Promise<void>,
    uploadDone: () => void,
    backendResponse: (id: string) => void;
    failure: () => void,
};

export function uploadFilesDialog(onData: (files: File[]) => void, accept: string) {
    const upload = createElement("input");
    upload.type = "file";
    upload.accept = accept;
    upload.click();
    upload.onchange = () => {
        onData(Array.from(upload.files ?? []));
    };
}

export function ProgressTracker(percentage: Pointer<number>, expectedSize: number) {
    let bytesUploaded = 0;

    return new TransformStream({
        transform(chunk, controller) {
            bytesUploaded += chunk.length;
            percentage.setValue((bytesUploaded / expectedSize) * 100);
            controller.enqueue(chunk);
        }
    });
}

export function StreamingUploadHandler(path: string, events: StreamingUploadEvents, file: File) {
    try {
        const ws = new WebSocket(`${API.BASE_URL.replace("https", "wss").replace("http", "ws")}${path}`);
        const progress = asPointer(0);
        progress.listen((percentage) => { events.onUploadTick(percentage); });

        const stream = file
            .stream()
            .pipeThrough(ProgressTracker(progress, file.size));
        ws.onopen = () => {
            ws.send(`JWT ${events.credentials()}`);
        };
        const reader = stream.getReader();

        ws.onmessage = async ({ data }) => {
            if (data == "failed") {
                console.log("Looks like we failed.");
                events.failure();
            }
            else if (data == "file") {
                ws.send(`file ${JSON.stringify({ filename: file.name, type: file.type })}`);
            } else if (data == "next") {
                const read = await reader.read();
                if (read.value)
                    ws.send(read.value);
                if (read.done) {
                    ws.send("end");
                    events.uploadDone();
                }
            } else {
                reader.releaseLock();
                events.backendResponse(data);
            }
        };
    } catch (error) {
        console.error(error);
        alert("There was an error uploading your files...\n\nPlease try again later");
    }
}