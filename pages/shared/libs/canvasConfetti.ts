// @deno-types="https://raw.githubusercontent.com/DefinitelyTyped/DefinitelyTyped/master/types/canvas-confetti/index.d.ts"
import confetti from "https://unpkg.com/canvas-confetti@1.9.0/src/confetti.js";

export function confettiFromElement(element: MouseEvent) {
    const { top, height, left, width, } = (<HTMLElement>element.target!).getBoundingClientRect();
    const x = (left + width / 2) / window.innerWidth;
    const y = (top + height / 2) / window.innerHeight;
    const origin = { x, y };
    confetti({ origin });
}
