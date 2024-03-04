import { defineConfig, PluginOption } from "npm:vite@4.5.0";
import viteDeno from "https://deno.land/x/vite_deno_plugin@v0.9.4/mod.ts";

export default defineConfig({
    ssr: {
        noExternal: /./
    },
    plugins: [
        {
            name: "1:http-imports2",
            enforce: "post",
            resolveId(id) {
                if(!id.startsWith("http")) return;
                console.error("resolveId", id);
            },
        },
        {
            name: "1:http-imports3",
            enforce: "pre",
            resolveId(id) {
                if(!id.startsWith("http")) return;
                console.error("resolveId", id);
            },
        },
        viteDeno() as PluginOption,
    ]
});