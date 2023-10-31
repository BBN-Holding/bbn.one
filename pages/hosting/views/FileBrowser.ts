import { deferred } from "std/async/deferred.ts";
import { format } from "std/fmt/bytes.ts";
import { BasicLabel, BIcon, Box, Entry, Grid, IconButton, Label, MIcon } from "webgen/mod.ts";
import { SidecarResponse } from "../../../spec/music.ts";
import { downloadFile, listFiles, messageQueueSidecar } from "../loading.ts";
import { deleteFileDialog } from "./dialogs/deleteFileDialog.ts";
import { DropHandler } from "./dropHandler.ts";
import { droppingFileHandler } from "./droppingFileHandler.ts";
import { fileTypeName } from "./fileTypeName.ts";
import { mapFiletoIcon } from "./icon.ts";
import { pathNavigation } from "./pathNavigation.ts";
import { allFiles, canWriteInFolder, loading, path } from "./state.ts";
import { createDownloadStream } from "./streamSaver.ts";
import { Table2 } from "./table2.ts";

export function FileBrowser() {
    return DropHandler(
        droppingFileHandler,
        Grid(
            Entry(Grid(
                BasicLabel({
                    title: "File Browser",
                    subtitle: "Drag and Drop files/folders here to upload and download them faster."
                }).setMargin("0 0 1rem 0"),
                pathNavigation(),
                canWriteInFolder.map(writeable => writeable ? Box() : Box(
                    MIcon("warning"),
                    Label("This folder is Read-only. You can't upload files here.")
                ).addClass("read-only-path")).asRefComponent(),
                new Table2(allFiles)
                    .addColumn("Name", (data) => Box(BIcon(mapFiletoIcon(data)), BasicLabel({ title: data.name }).addClass("small-text")).addClass("file-item"))
                    .addColumn("Last Modified", (data) => data.lastModified !== undefined ? Label(new Date(data.lastModified).toLocaleString()) : Box())
                    .addColumn("Type", (data) => data.fileMimeType !== undefined ? Label(fileTypeName(data.fileMimeType)) : Label("Folder"))
                    .addColumn("Size", (data) => data.size !== undefined ? Label(format(parseInt(data.size))).addClass('text-align-right') : Box())
                    .addColumn("", (data) => Grid(
                        data.fileMimeType && [ "text/yaml", "application/json" ].includes(data.fileMimeType.split(";")[ 0 ])
                            ? IconButton(MIcon("file_open"), "Open file")
                                .addClass("table-button")
                                .onClick(() => {
                                })
                            : Box(),
                        data.fileMimeType
                            ? IconButton(MIcon("download"), "Download")
                                .addClass("table-button")
                                .onClick(async () => {
                                    const stream = downloadFile(path.getValue() + data.name);
                                    await stream.pipeTo(createDownloadStream(data.name));
                                })
                            : Box(),
                        data.fileMimeType && data.canWrite
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
