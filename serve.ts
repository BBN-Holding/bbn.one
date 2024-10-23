import { serve } from "https://deno.land/x/esbuild_serve@1.4.1/mod.ts";
// import { serve } from "../esbuild_serve/mod.ts";

const title = new Map(Object.entries({
    "admin": "BBN Admin",
    "admin/review": "BBN Music - Review Drop",
    "hosting": "BBN Hosting",
    "hosting/create": "BBN Hosting",
    "settings": "BBN - Settings",
    "wallet": "BBN Wallet",
    "music": "BBN Music",
    "c/music": "BBN Music - Console",
    "c/music/new-drop": "BBN Music - New Drop",
    "c/music/edit": "BBN Music - Edit Drop",
    "c/music/payout": "BBN Music - Payouts",
    "p/privacy-policy": "BBN - Privacy Policy",
    "p/terms-of-use": "BBN - Terms of Use",
    "p/imprint": "BBN - Imprint",
    "p/distribution-agreement": "BBN - Distribution Agreement",
}));

const description = new Map(Object.entries({
    "default": "BBN Holding encompasses a variety of businesses, including music and hosting services. BBN Music provides music distribution, publishing, and label services, while BBN Hosting offers Minecraft hosting services.",
    "music": "BBN Music, your gateway to unlimited music distribution at a low cost. Maximize your reach without limits. Join us and let the world hear your music.",
}));

serve({
    port: 6969,
    extraLoaders: {
        ".webp": "file",
        ".jpg": "file",
    },
    assets: {
        "sitemap.xml": "./static/sitemap.xml",
        "robots.txt": "./static/robots.txt",
        "mitm.html": "./static/mitm.html",
        "sw.js": "./static/sw.js",
        "favicon.ico": "./static/favicon.ico",
        "email-header.png": "./static/email-header.png",
        "app.webmanifest": "./static/app.webmanifest",
        ".well-known/passkey-endpoints": "./static/.well-known/passkey-endpoints",
        "images/icons/icon-72x72.png": "./static/images/icons/icon-72x72.png",
        "images/icons/icon-96x96.png": "./static/images/icons/icon-96x96.png",
        "images/icons/icon-128x128.png": "./static/images/icons/icon-128x128.png",
        "images/icons/icon-144x144.png": "./static/images/icons/icon-144x144.png",
        "images/icons/icon-152x152.png": "./static/images/icons/icon-152x152.png",
        "images/icons/icon-192x192.png": "./static/images/icons/icon-192x192.png",
        "images/icons/icon-384x384.png": "./static/images/icons/icon-384x384.png",
        "images/icons/icon-512x512.png": "./static/images/icons/icon-512x512.png",
        "images/apple.png": "./static/images/apple.png",
    },
    pages: {
        "index": "./pages/holding/index.ts",
        "p/privacy-policy": "./pages/holding/privacyPolicy.ts",
        "p/terms-of-use": "./pages/holding/termsOfUse.ts",
        "p/imprint": "./pages/holding/imprint.ts",
        "p/distribution-agreement": "./pages/holding/distributionAgreement.ts",
        "signin": "./pages/user/signin.ts",
        "callback": "./pages/misc/callback.ts",
        "oauth": "./pages/user/oauth.ts",
        "music": "./pages/music-landing/main.ts",
        "c/music": "./pages/music/main.ts",
        "c/music/new-drop": "./pages/music/newDrop.ts",
        "c/music/edit": "./pages/music/edit.ts",
        "c/music/payout": "./pages/payout/main.ts",
        "hosting": "./pages/hosting/main.ts",
        "hosting/create": "./pages/hosting/views/create.ts",
        "settings": "./pages/user/settings.ts",
        "admin": "./pages/admin/admin.ts",
        "admin/review": "./pages/admin/review.ts",
        "wallet": "./pages/wallet/wallet.ts",
        "share": "./pages/music/share.ts",
    },
    defaultTemplate: createTemplate,
    poylfills: [
        "./polyfill.ts",
        "./bug-reporter.ts",
        "https://cdn.jsdelivr.net/npm/native-file-system-adapter@3.0.1/mod.js",
        "https://unpkg.com/urlpattern-polyfill",
    ],
});

function createTemplate(name: string, path: string) {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <title>${title.get(path) ?? "BBN Holding"}</title>
    <link rel="manifest" href="/app.webmanifest">
    <meta charset='UTF-8'>
    <meta name="description" content="${description.get(path) ?? description.get("default")}">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name='theme-color' content='black'>
    <meta name="mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black">
    <meta name="apple-mobile-web-app-title" content="${title.get(path) ?? "BBN Holding"}">
    <meta name="google" content="notranslate"/>
    <link rel="apple-touch-icon" href="/images/apple.png">
    <link rel="stylesheet" href="${name}.css">
    <script defer data-domain="bbn.one" src="https://pl.bbn.one/js/script.js"></script>
</head>

<body>
    <script src="${name}.js" type="module"></script>
</body>

</html>
    `.trim();
}
