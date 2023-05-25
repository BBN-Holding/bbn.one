import { serve } from "https://deno.land/x/esbuild_serve@1.2.4/mod.ts";

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
        "index": "./pages/holding/index.ts",
        "p/privacy": "./pages/OldPagesPolyfill.ts",
        "p/terms": "./pages/OldPagesPolyfill.ts",
        "p/imprint": "./pages/OldPagesPolyfill.ts",
        "p/distribution": "./pages/OldPagesPolyfill.ts",
        "p/leadership": "./pages/leadership.ts",
        "signin": "./pages/user/login.ts",
        "signin-google": "./pages/manager/misc/redirect.ts",
        "signin-discord": "./pages/manager/misc/redirect.ts",
        "signin-zendesk": "./pages/manager/misc/zendesk.ts",
        "oauth": "./pages/user/oauth.ts",

        "music": "./pages/music/main.ts",
        "music/new-drop": "./pages/manager/newDrop.ts",
        "music/edit": "./pages/manager/music/edit.ts",
        "music/payout": "./pages/payout/main.ts",

        "hosting": "./pages/hosting/main.ts",
        "hosting/create": "./pages/hosting/views/create.ts",

        "settings": "./pages/manager/settings/mod.ts",

        "admin": "./pages/admin/admin.ts",

        "wallet": "./pages/wallet/wallet.ts",
    },
    poylfills: [
        "https://unpkg.com/construct-style-sheets-polyfill@3.1.0",
        "https://unpkg.com/urlpattern-polyfill@8.0.2/"
    ]
});