import { serve } from "https://deno.land/x/esbuild_serve@0.2.3/mod.ts";

serve({
    port: 6969,
    extraLoaders: {
        ".webp": "file"
    },
    assets: {
        "sitemap.xml": "./static/sitemap.xml",
        "robots.txt": "./static/robots.txt",
    },
    pages: {
        "index": "./pages/index/index.ts",
        "p/privacy": "./pages/OldPagesPolyfill.ts",
        "p/terms": "./pages/OldPagesPolyfill.ts",
        "p/imprint": "./pages/OldPagesPolyfill.ts",
        "p/leadership": "./pages/leadership.ts",
        "signin": "./pages/manager/signin.ts",
        "signin-google": "./pages/manager/misc/redirect.ts",
        "music": "./pages/manager/music.ts",
        "music/new-drop": "./pages/manager/newDrop.ts"
    }
});