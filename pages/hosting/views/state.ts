import { dirname } from "@std/path";
import { RenderItem } from "shared/mod.ts";
import { asRef, Component, refMerge } from "webgen/mod.ts";
import { RemotePath } from "../types.ts";

export const currentFiles = asRef(<RemotePath[]> []);
export const hostingButtons = asRef(<Component[]> []);
export const auditLogs = asRef(<RenderItem[]> []);

export const uploadingFiles = asRef(<Record<string, RemotePath>> {});

export const allFiles = refMerge({
    uploadingFiles: uploadingFiles
        .map((files) =>
            Object.entries(files)
                .filter(([filePath]) => dirname(filePath) === path.getValue().replace(/\/$/, ""))
                .map(([_path, file]) => file)
        ),
    currentFiles: currentFiles.map((it) => {
        const { compare } = new Intl.Collator();
        return Array.from(it).sort((a, b) => compare(a.name, b.name)).sort((a, b) => Number(!!a.fileMimeType) - Number(!!b.fileMimeType));
    }),
}).map(({ currentFiles, uploadingFiles }) => [...uploadingFiles, ...currentFiles]);

export const path = asRef("");
export const loading = asRef(false);
export const canWriteInFolder = asRef(false);
