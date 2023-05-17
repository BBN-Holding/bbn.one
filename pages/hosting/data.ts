import { State } from "webgen/mod.ts";
import { Limits, Server } from "../../spec/music.ts";

const GB = 1000;
export const MB = 1000_000;

export const state = State({
    loaded: false,
    servers: <(Server)[]>[],
    meta: {
        coins: 13123122,
        ram: [ 10240000, 20000048 ],
        disk: [ 100240000, 900000048 ],
        slots: [ 1, 2 ],
        ports: [ 1, 1 ],
        dbs: [ 0, 1 ],
        limits: <Limits>{
            memory: 2 * GB,
            swap: 1 * GB,
            disk: 2 * GB,
            io: 100,
            cpu: 100,
        },
        plan: "FREE"
    }
});