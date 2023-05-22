import { Component, isPointer, Pointable, Pointer, State, Vertical } from "webgen/mod.ts";

// TODO: don't rerender the complete list on update. virtual list?

export const HeavyList = <T>(items: Pointable<T[]>, map: (val: T) => Component) => new class extends Component {
    constructor() {
        super();

        const list = isPointer(items) ? items : State({ items }).$items as Pointer<T[]>;

        list.on((val: T[]) => {
            this.wrapper.textContent = '';
            this.wrapper.append(
                Vertical(
                    ...val.map(x => map(x))
                )
                    .setGap("var(--gap)")
                    .draw()
            );
        });
    }
};

export const HeavyReRender = <T>(item: Pointable<T>, map: (val: T) => Component) => new class extends Component {
    constructor() {
        super();
        const it = isPointer(item) ? item : State({ item }).$item as Pointer<T>;
        it.on((val: T) => {
            this.wrapper.textContent = '';
            this.wrapper.append(map(val).draw());
        });
    }
};