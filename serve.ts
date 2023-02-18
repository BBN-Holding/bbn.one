import { serve } from "https://deno.land/x/esbuild_serve@1.2.2/mod.ts";

serve({
    port: 6969,
    extraLoaders: {
        ".webp": "file"
    },
    assets: {
        "sitemap.xml": "./static/sitemap.xml",
        "robots.txt": "./static/robots.txt",
        "favicon.ico": "./static/favicon.ico",
        "email-header.png": "./static/email-header.png"
    },
    pages: {
        "index": "./pages/index/index.ts",
        "p/privacy": "./pages/OldPagesPolyfill.ts",
        "p/terms": "./pages/OldPagesPolyfill.ts",
        "p/imprint": "./pages/OldPagesPolyfill.ts",
        "p/distribution": "./pages/OldPagesPolyfill.ts",
        "p/leadership": "./pages/leadership.ts",
        "signin": "./pages/manager/signin.ts",
        "signin-google": "./pages/manager/misc/redirect.ts",
        "music": "./pages/manager/music.ts",
        "music/new-drop": "./pages/manager/newDrop.ts",
        "music/edit": "./pages/manager/music/edit.ts",
        "settings": "./pages/manager/settings/mod.ts"
    },
    poylfills: [
        "https://unpkg.com/construct-style-sheets-polyfill@3.1.0"
    ]
});