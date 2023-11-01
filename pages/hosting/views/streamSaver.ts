// @deno-types="https://raw.githubusercontent.com/DefinitelyTyped/DefinitelyTyped/451dc8f/types/streamsaver/index.d.ts"
import streamSaver from "https://cdn.jsdelivr.net/npm/streamsaver@2.0.6/StreamSaver.min.js";
streamSaver.mitm = "/mitm.html";

export const createDownloadStream = streamSaver.createWriteStream;