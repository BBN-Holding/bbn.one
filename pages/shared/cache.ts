import { createKeyValue, lazy } from "webgen/mod.ts";

export const fileCache = lazy(() => createKeyValue<Blob>("file-cache"));
