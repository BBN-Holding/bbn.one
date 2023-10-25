import { asPointer } from "webgen/mod.ts";

import { FitAddon } from "https://esm.sh/xterm-addon-fit@0.8.0";
import { WebglAddon } from "https://esm.sh/xterm-addon-webgl@0.16.0";
import { Terminal } from "https://esm.sh/xterm@5.3.0";
import 'https://unpkg.com/@altronix/xterm@4.11.0-es6.5/xterm.css';

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
            fontSize: 11,
            disableStdin: true,
            convertEol: true
        });

        const fitAddon = new FitAddon();
        const webglAddon = new WebglAddon();
        this.terminal.open(this);
        this.terminal.loadAddon(fitAddon);
        this.terminal.loadAddon(webglAddon);

        webglAddon.onContextLoss(() => {
            webglAddon.dispose();
        });

        for (const line of this.heap) {
            this.terminal.write(line);
        }

        // Hack: Fit only works step by step and to remove to to load of resize oberserver we do this here.
        for (let index = 0; index < 40; index++) {
            fitAddon.fit();
        }

        this.resize = new ResizeObserver(() => {
            fitAddon.fit();
        });

        this.resize.observe(this);
        this.connected.setValue(true);

    }

    reset() {
        this.terminal.reset();
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