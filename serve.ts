import { serve, build, BuildOptions } from "https://deno.land/x/esbuild@v0.14.22/mod.js";
import { emptyDirSync } from "https://deno.land/std@0.126.0/fs/empty_dir.ts";
import { copySync, walkSync } from "https://deno.land/std@0.126.0/fs/mod.ts";
import { httpImports } from "https://deno.land/x/esbuild_plugin_http_imports@v1.2.3/index.ts";

export const config: BuildOptions = {
    metafile: true,
    loader: {
        ".woff": "file",
        ".woff2": "file",
        ".html": "file",
        ".svg": "file",
        ".png": "file",
        ".webp": "file"
    },
    plugins: [
        {
            name: "statpoints",
            setup(build) {
                build.onStart(() => {
                    emptyDirSync("dist");
                    emptyDirSync("dist/p/");
                    Array.from(walkSync("static")).forEach(x => copySync(`${x.path}`, `dist/${x.path.replace('static/', '')}`))

                    copySync("pages/templates/index.html", "dist/index.html");
                    copySync("pages/templates/leadership.html", "dist/p/leadership.html")
                    copySync("pages/templates/terms.html", "dist/terms.html")
                    copySync("pages/templates/privacy.html", "dist/privacy.html")
                    copySync("pages/templates/imprint.html", "dist/p/imprint.html")
                })
            }
        }, httpImports() ],
    bundle: true,
    entryPoints: {
        "index": "./pages/index/index.ts",
        "p/leadership": "./pages/leadership.ts",
        "polyfill": "./pages/OldPagesPolyfill.ts",
    },
    outdir: "dist/",
    minify: true,
    splitting: true,
    format: "esm",
    logLevel: "info",
};

if (Deno.args[ 0 ] == "dev" || Deno.args.length === 0) {
    console.log("🚀 WebServer @ http://localhost:1337");
    await serve({
        port: 1337,
        servedir: "dist",
        onRequest: ({ method, remoteAddress, path }) =>
            console.log("📦", method, `http://localhost${path} from ${remoteAddress}`),
    }, { ...config, minify: false, splitting: false });
} else {
    (await build(config));
    Deno.exit();
}
