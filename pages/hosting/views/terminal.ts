import { asPointer } from "webgen/mod.ts";

import attachAddon from "https://esm.sh/xterm-addon-attach@0.8.0";
import addon from "https://esm.sh/xterm-addon-fit@0.7.0";
import xterm from "https://esm.sh/xterm@5.2.1";
import 'https://unpkg.com/@altronix/xterm@4.11.0-es6.5/xterm.css';
import { API } from "../../shared/restSpec.ts";

// deno-lint-ignore no-explicit-any
const { FitAddon } = addon as any;

// deno-lint-ignore no-explicit-any
const { Terminal } = xterm as any;

// deno-lint-ignore no-explicit-any
const { AttachAddon } = attachAddon as any;

export class TerminalComponent extends HTMLElement {
    heap = <string[]>[];
    connected = asPointer(false);
    constructor() {
        super();
    }
    resize?: ResizeObserver;
    // deno-lint-ignore no-explicit-any
    terminal?: any;

    connectedCallback() {
        this.terminal = new Terminal({
            cursorBlink: true,
            convertEol: true,
        });

        const addon = new FitAddon();
        this.terminal.loadAddon(addon);
        this.terminal.open(this);
        const socket = new WebSocket(`ws:localhost:8443/api/@bbn/hosting/details/648f6069ee8ce2782157fe1a`);

        //SOLUTION 1
        // const attachAddon = new AttachAddon(socket);

        // socket.onopen = () => {
        //     console.log("WS OPENED")
        //     const auth = JSON.stringify({ event: "auth", token: `${API.getToken()}` });
        //     socket.send(auth);
        //     this.terminal.loadAddon(attachAddon)
        // };

        //SOLUTION 2
        socket.onopen = () => {
            console.log("WS OPENED")
            const auth = JSON.stringify({ event: "auth", token: `${API.getToken()}` });
            socket.send(auth);
        };

        socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            console.log(data);
            if (data.event === "console output") {
                this.write(data.args + "\n");
            }
            else if (data.event === "status") {
                //update status
            }
        }

        for (const line of this.heap) {
            this.terminal.write(line);
        }

        // Hack: Fit only works step by step and to remove to to load of resize oberserver we do this here.
        for (let index = 0; index < 40; index++) {
            addon.fit();
        }

        this.resize = new ResizeObserver(() => {
            addon.fit();
        });

        this.resize.observe(this);
        this.connected.setValue(true);

    }

    write(data: string) {
        this.heap.push(data);
        if (this.isConnected) {
            this.terminal.write(data);
        }
    }

    disconnectedCallback() {
        this.innerHTML = "";
        this.resize?.disconnect();
        this.connected.setValue(false);
    }
}

customElements.define("xterm-terminal", TerminalComponent);