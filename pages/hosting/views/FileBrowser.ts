import { deferred } from "std/async/deferred.ts";
import { format } from "std/fmt/bytes.ts";
import { asPointer, BasicLabel, BIcon, Box, Button, ButtonStyle, Color, Dialog, Entry, Grid, IconButton, Label, MIcon, ref, refMerge } from "webgen/mod.ts";
import { SidecarResponse } from "../../../spec/music.ts";
import { Progress } from "../../shared/Progress.ts";
import { ProgressTracker } from "../../shared/upload.ts";
import { downloadFile, listFiles, messageQueueSidecar } from "../loading.ts";
import { deleteFileDialog } from "./dialogs/deleteFileDialog.ts";
import { editFileDialog, editFileLanguage, editFilePath, editFilestreamingText } from "./dialogs/editFileDialog.ts";
import './dialogs/exportFileDialog.css';
import { DropHandler } from "./dropHandler.ts";
import { droppingFileHandler } from "./droppingFileHandler.ts";
import { fileTypeName } from "./fileTypeName.ts";
import { mapFiletoIcon } from "./icon.ts";
import { pathNavigation } from "./pathNavigation.ts";
import { allFiles, canWriteInFolder, loading, path, uploadingFiles } from "./state.ts";
import { createDownloadStream } from "./streamSaver.ts";
import { Table2 } from "./table2.ts";

const isExporting = asPointer(false);

const exportAvaiblable = refMerge({
    uploadingFiles: uploadingFiles.map(it => Object.keys(it).length !== 0 || !('showDirectoryPicker' in window)),
    isExporting
}).map(({ uploadingFiles, isExporting }) => !uploadingFiles && !isExporting);

const globalProgress = asPointer(0);
const currentFile = asPointer("");
const currentFileProgress = asPointer(0);
const exportingPhase = asPointer(<"Indexing download tree" | "Downloading Files">"Indexing download tree");
const collectedFiles = asPointer(0);
const currentFileIndex = asPointer(0);

export const exportingDialog = Dialog(() => Grid(
    Label(ref`Downloading Phase: ${exportingPhase}`),

    exportingPhase.map(phase =>
        phase === "Indexing download tree"
            ? Grid(
                Label("Searching for files to download..."),
                Label(ref`We have found ${collectedFiles} files. Please wait.`),
            )
            : Grid(
                // Download is in progress and we need to download this many fiels
                Label("We are downloading your files, please wait."),
                Progress(globalProgress),
                Label(ref`Downloading file ${currentFileIndex} of ${collectedFiles}`),
                Progress(currentFileProgress),
                BasicLabel({
                    title: ref`Downloading: ${currentFile}`
                }),
            )
    )
        .asRefComponent().addClass("details-block")

).addClass("exporting-dialog"))
    .setTitle("Download Folder");

async function getDirectoryHandle(pathIndex: number, directory: FileSystemDirectoryHandle, pathArray: string[]): Promise<FileSystemDirectoryHandle> {
    if (pathIndex === pathArray.length - 1)
        return directory;
    else
        return await getDirectoryHandle(pathIndex + 1, await directory.getDirectoryHandle(pathArray[ pathIndex ], { create: true }), pathArray);
}

export function FileBrowser() {
    return DropHandler(
        droppingFileHandler,
        Grid(
            Entry(Grid(
                Grid(
                    BasicLabel({
                        title: "File Browser",
                        subtitle: "Drag and Drop files/folders here to upload and download them faster."
                    }).setMargin("0 0 1rem 0"),
                    Button("Download Folder")
                        .setColor(exportAvaiblable.map(avaiblable => avaiblable ? Color.Grayscaled : Color.Disabled))
                        .setStyle(ButtonStyle.Secondary)
                        .onClick(async () => {
                            console.log("lol");
                            //@ts-ignore Modern feature
                            const picker: FileSystemDirectoryHandle = await showDirectoryPicker({ mode: "readwrite" });
                            exportingDialog.open();
                            isExporting.setValue(true);

                            const downloadTree = <{ path: string, size: number; }[]>[];
                            async function indexDownloadTree(path: string) {
                                const response = deferred<SidecarResponse>();
                                messageQueueSidecar.push({
                                    request: {
                                        type: "list",
                                        path: path
                                    },
                                    response
                                });

                                const data = await response;

                                if (data.type === "list") {
                                    for (const iterator of data.list) {
                                        if (iterator.fileMimeType) {
                                            downloadTree.push({
                                                path: path + iterator.name,
                                                size: iterator.size!
                                            });
                                            collectedFiles.setValue(collectedFiles.getValue() + 1);
                                        } else {
                                            await indexDownloadTree(path + iterator.name + "/");
                                        }
                                    }
                                } else {
                                    alert("Error while baking download treee");
                                    return;
                                }
                            }

                            exportingPhase.setValue("Indexing download tree");
                            await indexDownloadTree(path.getValue());
                            exportingPhase.setValue("Downloading Files");

                            for (const [ index, { path, size } ] of downloadTree.entries()) {
                                globalProgress.setValue((index / downloadTree.length) * 100);
                                currentFileIndex.setValue(index);
                                // Get DirectoryHandle from path
                                const pathArray = path.split("/");
                                const fileName = pathArray.at(-1)!;
                                const dir = await getDirectoryHandle(1, picker, pathArray);
                                const handler = await dir.getFileHandle(fileName, { create: true });
                                const writable = await handler.createWritable();
                                currentFile.setValue(path);
                                await downloadFile(path)
                                    .pipeThrough(ProgressTracker(currentFileProgress, size))
                                    .pipeTo(writable);
                            }

                            isExporting.setValue(false);
                            exportingDialog.close();
                        })
                )
                    .setRawColumns("auto max-content"),
                pathNavigation(),
                canWriteInFolder.map(writeable => writeable ? Box() : Box(
                    MIcon("warning"),
                    Label("This folder is Read-only. You can't upload files here.")
                ).addClass("read-only-path")).asRefComponent(),
                new Table2(allFiles)
                    .addColumn("Name", (data) => Box(
                        BIcon(mapFiletoIcon(data)),
                        BasicLabel({ title: data.name })
                            .addClass("small-text"),
                        ...data.uploadingRatio !== undefined ? [ MIcon("cloud") ] : [],
                    ).addClass("file-item"))
                    .addColumn("Last Modified", (data) => data.lastModified !== undefined ? Label(new Date(data.lastModified).toLocaleString()) : Box())
                    .addColumn("Type", (data) => data.fileMimeType !== undefined ? Label(fileTypeName(data.fileMimeType)) : Label("Folder"))
                    .addColumn("Size", (data) => data.size !== undefined ? Label(format(parseInt(data.size))).addClass('text-align-right') : Box())
                    .addColumn("", (data) => Grid(
                        data.uploadingRatio !== undefined ? Progress(data.uploadingRatio).addClass("fileProgressBar") : Box().removeFromLayout(),
                        data.fileMimeType && [ "text/yaml", "application/json" ].includes(data.fileMimeType.split(";")[ 0 ]) && data.uploadingRatio === undefined
                            ? IconButton(MIcon("file_open"), "Open file")
                                .addClass("table-button")
                                .onClick(() => {
                                    if (!data.fileMimeType) return;

                                    editFileLanguage.setValue(data.fileMimeType
                                        .split(";")[ 0 ]
                                        .split("/")[ 1 ]
                                    );
                                    editFilePath.setValue(path.getValue() + data.name);
                                    const stream = downloadFile(editFilePath.getValue());
                                    editFilestreamingText.setValue(stream.pipeThrough(new TextDecoderStream()));
                                    // Adding a Timeout so the first chunk is already loaded
                                    setTimeout(() => {
                                        editFileDialog.open();
                                    }, 200);
                                })
                            : Box(),
                        data.fileMimeType && data.uploadingRatio === undefined
                            ? IconButton(MIcon("download"), "Download")
                                .addClass("table-button")
                                .onClick(async () => {
                                    const stream = downloadFile(path.getValue() + data.name);
                                    await stream.pipeTo(createDownloadStream(data.name));
                                })
                            : Box(),
                        data.fileMimeType && data.canWrite && data.uploadingRatio === undefined
                            ? IconButton(MIcon("delete"), "Delete")
                                .addClass("table-button", "red")
                                .onClick(async () => {
                                    if (!await deleteFileDialog())
                                        return;
                                    const response = deferred<SidecarResponse>();
                                    messageQueueSidecar.push({
                                        request: {
                                            type: "delete",
                                            path: path.getValue() + data.name
                                        },
                                        response
                                    });

                                    // TODO: Backend should send a message when the file is deleted
                                    loading.setValue(true);
                                    listFiles(path.getValue()).finally(() => loading.setValue(false));

                                    setTimeout(() => {
                                        loading.setValue(true);
                                        listFiles(path.getValue()).finally(() => loading.setValue(false));
                                    }, 1000);
                                    await response;

                                })
                            : Box()
                    ).setEvenColumns(3))
                    .setColumnTemplate("auto auto auto auto min-content")
                    .setRowClickEnabled((rowIndex) => !allFiles.getValue()[ rowIndex ].fileMimeType)
                    .setRowClick((rowIndex) => {
                        const data = allFiles.getValue()[ rowIndex ];
                        // Only folders
                        path.setValue(`${path.getValue() + data.name}/`);
                        loading.setValue(true);
                        listFiles(path.getValue()).finally(() => loading.setValue(false));
                    })
            )).addClass("file-browser")
        )
    ).addClass("drop-area");
}