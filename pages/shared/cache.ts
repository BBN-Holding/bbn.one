import { createKeyValue, lazyInit } from "webgen/mod.ts";

export const fileCache = lazyInit(() => createKeyValue<Blob>("file-cache"));
