import { serve } from "https://deno.land/x/esbuild_serve@0.0.5/mod.ts";

serve({
    extraLoaders: {
        ".webp": "file"
    },
    pages: {
        "index": "./pages/index/index.ts",
        "p/privacy": "./pages/OldPagesPolyfill.ts",
        "p/terms": "./pages/OldPagesPolyfill.ts",
        "p/imprint": "./pages/OldPagesPolyfill.ts",
        "p/leadership": "./pages/leadership.ts"
    }
})