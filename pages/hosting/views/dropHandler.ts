import { readableStreamFromIterable } from "https://deno.land/std@0.200.0/streams/readable_stream_from_iterable.ts";
import { sumOf } from "std/collections/sum_of.ts";
import { Component, asPointer } from "webgen/mod.ts";
import { FileEntry, countFileTree, getFileStream } from "./fileHandler.ts";

const supportsFileSystemAccessAPI =
    'getAsFileSystemHandle' in DataTransferItem.prototype;
const supportsWebkitGetAsEntry =
    'webkitGetAsEntry' in DataTransferItem.prototype;

declare global {
    interface DataTransferItem {
        getAsFileSystemHandle: () => Promise<FileSystemHandle | FileSystemDirectoryHandle>;
    }
}

export function DropHandler(onData: (data: ReadableStream<FileEntry>, length: number) => void, component: Component) {
    return new class extends Component {
        hovering = asPointer(false);
        constructor() {
            super();
            this.addClass(this.hovering.map(it => it ? "hovering" : "default"), "drop-area");
            this.wrapper.ondragover = (ev) => {
                ev.preventDefault();
                this.hovering.setValue(true);
            };
            this.wrapper.ondragleave = (ev) => {
                ev.preventDefault();
                console.log(ev);
                if (ev.target && !this.wrapper.contains(ev.relatedTarget as Node))
                    this.hovering.setValue(false);
            };
            this.wrapper.ondrop = async (ev) => {
                ev.preventDefault();
                if (!supportsFileSystemAccessAPI) {
                    alert("Please upgrade you Browser to use the latest features");
                    return;
                }
                if (!supportsFileSystemAccessAPI && !supportsWebkitGetAsEntry || !ev.dataTransfer) return;

                this.hovering.setValue(false);
                const files = await Promise.all([ ...ev.dataTransfer.items ]
                    .filter(item => item.kind === 'file') // File means file or directory
                    .map(item => item.getAsFileSystemHandle() as Promise<FileSystemHandle | FileSystemDirectoryHandle>));

                const fileSizeCount = sumOf(await Promise.all(files.filter(it => it).map(it => countFileTree(it!))), it => it);

                onData?.(readableStreamFromIterable(files)
                    .pipeThrough(new TransformStream<FileSystemHandle | null, FileEntry>({
                        async transform(chunk, controller) {
                            if (!chunk) return;
                            for await (const iterator of getFileStream(chunk)) {
                                controller.enqueue(iterator);
                            }
                        }
                    })), fileSizeCount);
            };
            this.wrapper.append(component.draw());
        }
    };
}