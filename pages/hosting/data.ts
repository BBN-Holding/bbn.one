import { State } from "webgen/mod.ts";

export const data = State({
    servers: <{
        id: string;
        name: string;
        server: string,
        location: string;
    }[]>[
            {
                id: "1",
                name: "Skywars",
                server: "Minecraft - v1.19.3",
                location: "🇩🇪 Frankfurt"
            }
        ],
    meta: {
        coins: 13123122,
        ram: [ 10240000, 20000048 ],
        disk: [ 100240000, 900000048 ],
        slots: [ 1, 2 ],
        ports: [ 1, 1 ],
        dbs: [ 0, 1 ],
        plan: "FREE"
    }
});