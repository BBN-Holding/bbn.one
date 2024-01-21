import { FileEntry } from "shared/fileHandler.ts";
import { asRef } from "webgen/mod.ts";
import { listFiles, uploadFile } from "../../loading.ts";
import { RemotePath } from "../../types.ts";
import { canWriteInFolder, loading, path, uploadingFiles } from "../state.ts";

export const droppingFileHandler = async (files: ReadableStream<FileEntry>, count: number): Promise<void> => {
    if (!canWriteInFolder.getValue()) {
        alert("This folder is Read-only. You can't upload files here.");
        return;
    }
    console.log("Uploading", count, "files");
    for await (const uploadingPath of files) {
        const currentPath = path.getValue();
        const progressTracker = asRef(0);
        uploadingFiles.setValue({
            ...uploadingFiles.getValue(),
            [ `${currentPath}${uploadingPath.path}` ]: <RemotePath>{
                uploadingRatio: progressTracker,
                fileMimeType: `${uploadingPath.file.type};`,
                lastModified: uploadingPath.file.lastModified,
                size: uploadingPath.file.size,
                name: uploadingPath.file.name,
            }
        });
        await uploadFile(currentPath + uploadingPath.path, uploadingPath.file, progressTracker);
        uploadingFiles.setValue(Object.fromEntries(Object.entries(uploadingFiles.getValue()).filter(([ path ]) => path != `${currentPath}${uploadingPath.path}`)));
    }
    loading.setValue(true);
    listFiles(path.getValue()).finally(() => loading.setValue(false));
};
