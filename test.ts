const path = new URL("https://api.modrinth.com/v2/search");

path.searchParams.set("index", "relevance");
path.searchParams.set("facets", JSON.stringify([
    [
        "categories:'bukkit'",
        "categories:'spigot'",
        "categories:'paper'",
        "categories:'purpur'",
        "categories:'sponge'",
        "categories:'bungeecord'",
        "categories:'waterfall'",
        "categories:'velocity'",
        "categories:'folia'"
    ],
    [ "project_type:mod" ]
]));

const data = await fetch(path);

const list = await data.json();
console.log(Deno.inspect(list, {
    depth: 2,
    colors: true,
}));