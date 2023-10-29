import { RenderItem } from "shared";
import { dirname } from "std/path/mod.ts";
import { asPointer, Component, refMerge } from "webgen/mod.ts";
import { currentFiles, currentPath, RemotePath } from "../loading.ts";


export const hostingButtons = asPointer(<Component[]>[]);
export const auditLogs = asPointer(<RenderItem[]>[]);
export const uploadingFiles = asPointer(<Record<string, number | "failed">>{});
export const allFiles = refMerge({
    uploadingFiles: uploadingFiles
        .map(files => Object.entries(files)
            .filter(([ path ]) => dirname(path) === currentPath.getValue())
            .map(([ name, uploadingRatio ]) => (<RemotePath>{ name, uploadingRatio }))
        ),
    currentFiles: currentFiles.map(it => {
        const { compare } = new Intl.Collator();
        return Array.from(it).sort((a, b) => compare(a.name, b.name)).sort((a, b) => Number(!!a.fileMimeType) - Number(!!b.fileMimeType));

    })
}).map(({ currentFiles, uploadingFiles }) => [ ...uploadingFiles, ...currentFiles ]);

export const path = asPointer("");
export const loading = asPointer(false);
