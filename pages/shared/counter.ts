// import { randomInteger } from "@std/collections/_utils.ts";
import { randomInteger } from "https://jsr.io/@std/collections/1.0.1/_utils.ts";
import { asRef, Box, css, Label, Reference } from "webgen/mod.ts";

export function Counter(value: Reference<number>) {
    const id = randomInteger(1000, 100000);

    // these need to be unique
    document.adoptedStyleSheets.push(css`
        ::view-transition-old(${`counter-${id}`}) {
            animation: 90ms cubic-bezier(0.4, 0, 1, 1) both fade-out,
                300ms cubic-bezier(0.4, 0, 0.2, 1) both slide-to-top;
            display: inline-block;
        }

        ::view-transition-new(${`counter-${id}`}) {
            animation: 210ms cubic-bezier(0, 0, 0.2, 1) 90ms both fade-in,
                300ms cubic-bezier(0.4, 0, 0.2, 1) both slide-from-bottom;
            display: inline-block;
        }
    `);

    const counter = asRef(Box());

    function findDifferenceAndSplit(str1: string, str2: string) {
        const minLength = Math.min(str1.length, str2.length);
        let diffIndex = -1;

        for (let i = 0; i < minLength; i++) {
            if (str1[i] !== str2[i]) {
                diffIndex = i;
                break;
            }
        }

        if (diffIndex === -1 && str1.length === str2.length) {
            return { unchangedPart: str1, changedPart: "" };
        } else if (diffIndex === -1) {
            return {
                unchangedPart: str1.length < str2.length ? str1 : str2,
                changedPart: str1.length < str2.length ? "" : str2.slice(str1.length),
            };
        } else {
            return {
                unchangedPart: str1.slice(0, diffIndex),
                changedPart: str2.slice(diffIndex),
            };
        }
    }

    value.listen((newVal: number, oldVal: number | undefined) => {
        const { unchangedPart, changedPart } = findDifferenceAndSplit(oldVal?.toLocaleString() ?? "", newVal.toLocaleString());

        function update() {
            counter.setValue(Box(
                Label(unchangedPart),
                Label(changedPart).addClass(`updating-${id}`),
            ));
        }

        // if ('startViewTransition' in document) {
        //     // deno-lint-ignore no-explicit-any
        //     const item = document.querySelector(".updating-" + id) as any;
        //     if (item)
        //         item.style.viewTransitionName = "counter-" + id;
        //     // deno-lint-ignore no-explicit-any
        //     // (<any>document).startViewTransition(() => {
        //     // if we don't cleanup we could trigger all view transitions. i don't know if we can make this unique (ShadowDOM!?)
        //     // if (item) item.style.viewTransitionName = "";
        //     // update();
        //     // });
        //     // TODO: Make some polyfill, or just wait until all browsers catch on.
        // } else
        update();
    });

    return counter.asRefComponent();
}
