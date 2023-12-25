import loader from "https://esm.sh/@monaco-editor/loader@1.4.0";
import { editor } from "https://esm.sh/monaco-editor@0.44.0/esm/vs/editor/editor.api.js";
import { Box, Custom, asPointer, lazyInit } from "webgen/mod.ts";
import './editFileDialog.css';

const lazyMonaco = lazyInit(() => loader.init());

export const editFileLanguage = asPointer("yaml");
export const editFilestreamingText = asPointer(new Response("Loading file...").body?.pipeThrough(new TextDecoderStream())!);
export const editFileDownloading = asPointer(true);
export const editFileUploading = asPointer(false);
export const editFilePath = asPointer("");
export const editFileCurrentEditor = asPointer<editor.IStandaloneCodeEditor | undefined>(undefined);

async function createMonacoEditor() {
    const monaco = await lazyMonaco();
    const box = document.createElement("div");
    const editor = monaco.editor.create(box, {
        value: "",
        language: "yaml",
        theme: "vs-dark",
        automaticLayout: true,
    });

    editFileLanguage.listen(lang => {
        monaco.editor.setModelLanguage(editor.getModel()!, lang);
    });

    editFilestreamingText.listen(async streamingText => {
        editFileDownloading.setValue(true);
        editor.setValue("");
        for await (const iterator of streamingText) {
            editor.setValue(editor.getValue() + iterator);
        }
        editFileDownloading.setValue(false);
    });

    editFileDownloading.listen(downloading => {
        editor.updateOptions({
            readOnly: downloading
        });
    });

    editFileUploading.listen(uploading => {
        editor.updateOptions({
            readOnly: uploading
        });
    });

    editFileCurrentEditor.setValue(editor);
    return Custom(box).addClass("file-dialog-shell");
}

export const editFileDialog = Box();

//     Dialog(() =>
//     Vertical(
//         refMerge({
//             downloading: editFileDownloading,
//             uploading: editFileUploading
//         }).map(({ downloading, uploading }) => (() => {
//             if (downloading)
//                 return Box(
//                     MIcon("cloud_download"),
//                     Label("Your file is currently downloading...")
//                 )
//                     .addClass("file-is-downloading");

//             if (uploading)
//                 return Box(
//                     MIcon("cloud_upload"),
//                     Label("Your file is currently uploading...")
//                 )
//                     .addClass("file-is-downloading");

//             return Box(
//                 MIcon("cloud_done"),
//                 Label("Your file is up to date")
//             ).addClass("file-is-downloading");
//         })()
//         ).asRefComponent(),
//         Cache("monaco-editor", () => createMonacoEditor(),
//             (type, data) => type === "cache" ? Label("Loading Editor") : data ?? Box()
//         )
//     )
// )
//     .allowUserClose()
//     .setTitle("Edit File")
//     .addButton("Cancel", "close")
//     .addButton("Save", async () => {
//         if (editFileDownloading.getValue())
//             return alert("File is still downloading");
//         editFileUploading.setValue(true);
//         const editor = editFileCurrentEditor.getValue()!;
//         await uploadFile(
//             editFilePath.getValue(),
//             new File([ editor.getValue() ], editFilePath.getValue()),
//             asPointer(0)
//         );
//         editFileUploading.setValue(false);
//         await delay(300);
//         return "close";
//     });