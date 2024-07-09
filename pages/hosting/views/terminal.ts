import { FitAddon } from "https://esm.sh/@xterm/addon-fit@0.10.0";
import "https://esm.sh/@xterm/xterm@5.5.0/css/xterm.css";
import { WebglAddon } from "https://esm.sh/xterm-addon-webgl@0.16.0";
import { Terminal } from "https://esm.sh/xterm@5.3.0";
import { asRef } from "webgen/mod.ts";

export class TerminalComponent extends HTMLElement {
    heap = <string[]> [];
    connected = asRef(false);
    constructor() {
        super();
    }
    resize?: ResizeObserver;
    terminal?: Terminal;

    connectedCallback() {
        this.terminal = new Terminal({
            fontSize: 11,
            disableStdin: true,
            cursorBlink: true,
            convertEol: true,
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
            for (let index = 0; index < 5; index++) {
                fitAddon.fit();
            }
        });

        this.resize.observe(this);
        this.connected.setValue(true);
    }

    reset() {
        this.terminal!.reset();
        // hide the cursor
        this.terminal!.write("\x1b[?25l");
    }

    write(data: string) {
        this.heap.push(data);
        if (this.isConnected) {
            this.terminal!.write(data);
        }
    }

    disconnectedCallback() {
        this.innerHTML = "";
        this.resize?.disconnect();
        this.connected.setValue(false);
    }
}

customElements.define("xterm-terminal", TerminalComponent);
