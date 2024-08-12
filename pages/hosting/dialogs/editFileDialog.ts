import loader from "https://esm.sh/@monaco-editor/loader@1.4.0";
import { editor } from "https://esm.sh/monaco-editor@0.44.0/esm/vs/editor/editor.api.js";

import { delay } from "@std/async";
import { asRef, Box, Button, Cache, Color, Custom, Grid, Label, lazy, MIcon, refMerge, SheetDialog, Vertical } from "webgen/mod.ts";
import { sheetStack } from "../../shared/helper.ts";
import { uploadFile } from "../loading.ts";
import "./editFileDialog.css";

const lazyMonaco = lazy(() => loader.init());

export const editFileLanguage = asRef("yaml");
export const editFilestreamingText = asRef(new Response("Loading file...").body?.pipeThrough(new TextDecoderStream())!);
export const editFileDownloading = asRef(true);
export const editFileUploading = asRef(false);
export const editFileReadOnly = asRef(false);
export const editFilePath = asRef("");
export const editFileCurrentEditor = asRef<editor.IStandaloneCodeEditor | undefined>(undefined);

async function createMonacoEditor() {
    const monaco = await lazyMonaco();
    const box = document.createElement("div");
    const editor = monaco.editor.create(box, {
        value: "",
        language: "yaml",
        theme: "vs-dark",
        automaticLayout: true,
    });

    editFileLanguage.listen((lang) => {
        monaco.editor.setModelLanguage(editor.getModel()!, lang);
    });

    editFilestreamingText.listen(async (streamingText) => {
        editFileDownloading.setValue(true);
        editor.setValue("");
        for await (const iterator of streamingText) {
            editor.setValue(editor.getValue() + iterator);
        }
        editFileDownloading.setValue(false);
    });

    editFileDownloading.listen((downloading) => {
        editor.updateOptions({
            readOnly: downloading || editFileReadOnly.getValue(),
        });
    });

    editFileUploading.listen((uploading) => {
        editor.updateOptions({
            readOnly: uploading || editFileReadOnly.getValue(),
        });
    });

    editFileCurrentEditor.setValue(editor);
    return Custom(box).addClass("file-dialog-shell");
}

export const editFileDialog = SheetDialog(
    sheetStack,
    editFileReadOnly.map<string>((readOnly) => readOnly ? "Read File" : "Edit File"),
    Vertical(
        refMerge({
            downloading: editFileDownloading,
            uploading: editFileUploading,
        }).map(({ downloading, uploading }) =>
            (() => {
                if (downloading) {
                    return Box(
                        MIcon("cloud_download"),
                        Label("Your file is currently downloading..."),
                    )
                        .addClass("file-is-downloading");
                }

                if (uploading) {
                    return Box(
                        MIcon("cloud_upload"),
                        Label("Your file is currently uploading..."),
                    )
                        .addClass("file-is-downloading");
                }

                return Box(
                    MIcon("cloud_done"),
                    Label("Your file is up to date"),
                ).addClass("file-is-downloading");
            })()
        ).asRefComponent(),
        Cache("monaco-editor", () => createMonacoEditor(), (type, data) => type === "cache" ? Label("Loading Editor") : data ?? Box()),
        Grid(
            Button("Cancel").onClick(() => editFileDialog.close()),
            Button("Save").onPromiseClick(async () => {
                if (editFileReadOnly.getValue()) {
                    return;
                }
                if (editFileDownloading.getValue()) {
                    return alert("File is still downloading");
                }
                editFileUploading.setValue(true);
                const editor = editFileCurrentEditor.getValue()!;
                await uploadFile(
                    editFilePath.getValue(),
                    new File([editor.getValue()], editFilePath.getValue()),
                    asRef(0),
                );
                editFileUploading.setValue(false);
                await delay(300);
                editFileDialog.close();
            })
                .setColor(editFileReadOnly.map<Color>((readOnly) => readOnly ? Color.Disabled : Color.Grayscaled)),
        )
            .setGap(".5rem")
            .setJustifyItems("end")
            .setRawColumns("auto max-content"),
    ),
);
