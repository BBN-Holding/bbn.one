import { uploadFile } from "../loading.ts";
import { FileEntry } from "./fileHandler.ts";
import { canWriteInFolder, path, uploadingFiles } from "./state.ts";


export const droppingFileHandler = async (files: ReadableStream<FileEntry>, count: number): Promise<void> => {
    if (!canWriteInFolder.getValue()) {
        alert("This folder is Read-only. You can't upload files here.");
        return;
    }
    console.log("Uploading", count, "files");
    for await (const _iterator of files) {
        await new Promise<void>((done) => {
            uploadFile(path.getValue() + _iterator.path, _iterator.file, (ratio) => {
                uploadingFiles.setValue({
                    ...uploadingFiles.getValue(),
                    [ `/${_iterator.path}` ]: ratio
                });
                if (ratio >= 1) {
                    done();
                }
            });
        });
        uploadingFiles.setValue(Object.fromEntries(Object.entries(uploadingFiles.getValue()).filter(([ path ]) => path != _iterator.path)));
    }
};
