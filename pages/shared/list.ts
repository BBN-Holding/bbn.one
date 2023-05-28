import { Component, Horizontal, Icon, isPointer, PlainText, Pointable, Pointer, State, Vertical } from "webgen/mod.ts";
import { LoadingSpinner } from "./components.ts";
import { displayError, External } from "./restSpec.ts";

// TODO: don't rerender the complete list on update. virtual list?

export const HeavyList = <T>(items: Pointable<External<T[]> | T[]>, map: (val: T) => Component) => new class extends Component {
    constructor() {
        super();
        console.debug("HeavyList got constructed");
        const list = isPointer(items) ? items : State({ items }).$items as Pointer<T[]>;

        list.on((val: External<T[]> | T[]) => {
            this.wrapper.textContent = '';
            if (val === "loading")
                this.wrapper.append(
                    LoadingSpinner().draw()
                );
            else if ('status' in val) {
                if (val.status === "fulfilled")
                    this.wrapper.append(
                        Vertical(
                            ...val.value.map(x => map(x))
                        )
                            .setGap("var(--gap)")
                            .draw()
                    );
                else
                    this.wrapper.append(
                        Horizontal(
                            Vertical(
                                Icon("error"),
                                PlainText(displayError(val.reason))
                            )
                                .setAlign("center")
                                .setGap("calc(var(--gap) * 0.25)")
                                .addClass("error-message")
                        )
                            .draw()
                    );
            }
            else
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
        console.debug("HeavyReRender got constructed");
        const it = isPointer(item) ? item : State({ item }).$item as Pointer<T>;
        it.on((val: T) => {
            this.wrapper.textContent = '';
            this.wrapper.append(map(val).draw());
        });
    }
};