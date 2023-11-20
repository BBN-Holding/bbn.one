import { ServerTypes } from "../../spec/music.ts";

const apiUrl = "https://api.modrinth.com/v2";

type SearchResponse = {
    hits: ModrinthProject[],
    offset: number,
    limit: number,
    total_hits: number,
};

type ModrinthProject = {
    project_id: string,
    project_type: string,
    slug: string,
    author: string,
    title: string,
    description: string,
    categories: string[],
    display_categories: string[],
    versions: string[],
    downloads: number,
    follows: number,
    icon_url: string,
    date_created: string,
    date_modified: string,
    latest_version: string,
    license: string,
    client_side: "unsupported" | "optional" | "required",
    server_side: "unsupported" | "optional" | "required",
    gallery: [],
    color: number,
};

type ModrinthDownload = {
    id: string,
    project_id: string,
    author_id: string,
    featured: boolean,
    name: string,
    files: {
        hashes: {
            sha1: string,
            sha512: string,
        },
        url: string,
        filename: string,
        primary: boolean,
        size: number,
    }[],
    dependencies: {
        version_id: string | null,
        project_id: string,
        file_name: string | null,
        dependency_type: "optional" | "required";
    }[],
};

// @ts-ignore ignore unsupported server types
const ServerTypeToModrinthTypeMap: Record<ServerTypes, string[]> = {
    [ ServerTypes.Default ]: [ "bukkit", "spigot", "paper", "purpur", "folia" ],
    [ ServerTypes.Fabric ]: [ "fabric" ],
    [ ServerTypes.Forge ]: [ "forge" ],
};

async function find(versions: string[], type: ServerTypes, offset = 0, limit = 10) {
    const path = new URL(`${apiUrl}/search`);
    path.searchParams.set("index", "relevance");
    if (!Object.keys(ServerTypeToModrinthTypeMap).includes(type)) throw new Error("Invalid server type");
    path.searchParams.set("facets", JSON.stringify([
        ServerTypeToModrinthTypeMap[ type ].map((v) => `categories:${v}`),
        [ "project_type:mod" ],
        versions.map(version => "versions:" + version),
        [ "server_side:required" ],
    ]));
    path.searchParams.set("limit", limit.toString());
    path.searchParams.set("offset", offset.toString());
    const json = await (await fetch(path)).json() as SearchResponse;
    return json.hits;
}

async function getLatestDownload(versions: string[], type: ServerTypes, projectid: string) {
    const path = new URL(`${apiUrl}/project/${projectid}/version`);
    path.searchParams.set("loaders", JSON.stringify(ServerTypeToModrinthTypeMap[ type ]));
    path.searchParams.set("game_versions", JSON.stringify(versions));

    const json = await (await fetch(path)).json();
    return json[ 0 ] as ModrinthDownload;
}

async function getSpecificDownload(versionId: string) {
    const path = new URL(`${apiUrl}/version/${versionId}`);
    const json = await (await fetch(path)).json();
    return json as ModrinthDownload;
}

async function collectDownloadList(versions: string[], type: ServerTypes, projectid: string, versionId?: string): Promise<string[]> {
    const download = versionId ? await getSpecificDownload(versionId) : await getLatestDownload(versions, type, projectid);
    if (!download) return [];
    return [
        download.id,
        ...await Promise.all(
            download.dependencies
                .filter(v => v.dependency_type === "required")
                .map((v) => collectDownloadList(versions, type, v.project_id, v.version_id ?? undefined)))
    ] as string[];
}

async function getRealFiltered(versions: string[], type: ServerTypes, offset = 0) {
    const projects = await find(versions, type, offset);
    const downloads = await Promise.all(projects.map(async (project, index) => ({ project, index, download: await getLatestDownload(versions, type, project.project_id) })));
    const firstten = downloads.filter(v => v.download !== null).slice(0, 10); // We just hope that there are 10 projects with downloads
    return { lastindex: firstten.at(-1)?.index ?? -1, projects: firstten.map(v => ({ project: v.project, download: v.download })) };
}

// console.log(await getRealFiltered(["1.20.2", "1.20"], ServerTypes.Default)); // Gets a list of projects with fitting downloads, returns the last index of the last project for the offset for next req and the projects
// console.log(await collectDownloadList(["1.20.2", "1.20"], ServerTypes.Default, (await getRealFiltered(["1.20.2", "1.20"], ServerTypes.Default)).projects[ 4 ].project.project_id)); // Gets a list of downloads for a project, returns the list of download ids