import { serve } from "../esbuild_serve/mod.ts";

const title = new Map(Object.entries({
    admin: "BBN Admin Panel",
    "hosting": "BBN Hosting",
    "hosting/create": "BBN Hosting",
    "settings": "BBN One - Settings",
    "wallet": "BBN Wallet",
    "music": "BBN Music",
    "music/new-drop": "BBN Music - New Drop",
    "music/edit": "BBN Music - Edit Drop",
    "music/payout": "BBN Music - Payout"
}));

serve({
    port: 6969,
    extraLoaders: {
        ".webp": "file"
    },
    assets: {
        "sitemap.xml": "./static/sitemap.xml",
        "robots.txt": "./static/robots.txt",
        "favicon.ico": "./static/favicon.ico",
        "email-header.png": "./static/email-header.png",
        "app.webmanifest": "./static/app.webmanifest",
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
        "p/privacy": "./pages/OldPagesPolyfill.ts",
        "p/terms": "./pages/OldPagesPolyfill.ts",
        "p/imprint": "./pages/OldPagesPolyfill.ts",
        "p/distribution": "./pages/OldPagesPolyfill.ts",
        "signin": "./pages/user/signin.ts",
        "signin-zendesk": "./pages/manager/misc/zendesk.ts",
        "callback": "./pages/manager/misc/callback.ts",
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
    defaultTemplate: createTemplate,
    poylfills: [
        "./bug-reporter.ts",
        "https://unpkg.com/construct-style-sheets-polyfill@3.1.0",
        "https://unpkg.com/urlpattern-polyfill@8.0.2/"
    ]
});

function createTemplate(name: string, path: string) {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <title>${title.get(path) ?? "BBN One"}</title>
    <link rel="manifest" href="/app.webmanifest">
    <meta charset='UTF-8'>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name='theme-color' content='black'>
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black">
    <meta name="apple-mobile-web-app-title" content="BBN One">
    <link rel="apple-touch-icon" href="/images/apple.png">
    <link rel="preconnect" href="https://fonts.gstatic.com">
    <link rel="stylesheet" href="${name}.css">
    <script>(function (w, d, s, l, i) {
            w[ l ] = w[ l ] || []; w[ l ].push({
                'gtm.start':
                    new Date().getTime(), event: 'gtm.js'
            }); var f = d.getElementsByTagName(s)[ 0 ],
                j = d.createElement(s), dl = l != 'dataLayer' ? '&l=' + l : ''; j.async = true; j.src =
                    'https://www.googletagmanager.com/gtm.js?id=' + i + dl; f.parentNode.insertBefore(j, f);
        })(window, document, 'script', 'dataLayer', 'GTM-KMCWNVD');</script>
</head>

<body>
    <noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-KMCWNVD" height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
    <script src="${name}.js" type="module"></script>
</body>

</html>
    `.trim();
}