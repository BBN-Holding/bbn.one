import { serve } from "https://deno.land/x/esbuild_serve@0.0.6/mod.ts";

serve({
    port: 6969,
    extraLoaders: {
        ".webp": "file"
    },
    pages: {
        "index": "./pages/index/index.ts",
        "p/privacy": "./pages/OldPagesPolyfill.ts",
        "p/terms": "./pages/OldPagesPolyfill.ts",
        "p/imprint": "./pages/OldPagesPolyfill.ts",
        "p/leadership": "./pages/leadership.ts",
        "sitemap": "./static/sitemap.xml",
        "robots": "./static/robots.txt",
    }
})