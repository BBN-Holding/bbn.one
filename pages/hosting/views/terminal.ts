import { asPointer } from "webgen/mod.ts";

import addon from "https://esm.sh/xterm-addon-fit@0.7.0";
import xterm from "https://esm.sh/xterm@5.2.1";
import 'https://unpkg.com/@altronix/xterm@4.11.0-es6.5/xterm.css';

// deno-lint-ignore no-explicit-any
const { FitAddon } = addon as any;

// deno-lint-ignore no-explicit-any
const { Terminal } = xterm as any;

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
            convertEol: true,
            fontSize: 10,
            disableStdin: true,
            minimumContrastRatio: 7,
            theme: {
                selection: "#27abf1"
            }
        });

        const addon = new FitAddon();
        this.terminal.loadAddon(addon);
        this.terminal.open(this);

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