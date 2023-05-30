import { Box, Button, Component, Horizontal, Icon, isPointer, PlainText, Pointable, Pointer, Reactive, State, Vertical } from "webgen/mod.ts";
import { LoadingSpinner } from "./components.ts";
import { displayError, External } from "./restSpec.ts";

// TODO: don't rerender the complete list on update. virtual list?
export const HeavyList = <T>(items: Pointable<External<T[]> | 'loading' | T[]>, map: (val: T) => Component) => new class extends Component {
    placeholder = Box();
    loadMore = async () => { };
    paging = State({ enabled: false, limit: 30 });

    constructor() {
        super();
        console.debug("HeavyList got constructed");
        const list = isPointer(items) ? items : State({ items }).$items as Pointer<T[]>;

        list.on((val: External<T[]> | 'loading' | T[]) => {
            this.wrapper.textContent = '';
            if (val === "loading")
                this.wrapper.append(
                    LoadingSpinner().draw()
                );
            else if ('status' in val) {
                if (val.status === "fulfilled")
                    this.wrapper.append(
                        Reactive(
                            this.paging, "enabled", () => this.canLoadMore(val.value.length)
                                ? Vertical(
                                    ...val.value.length == 0 ? [ this.placeholder ] : val.value.filter((_, i) => i).map(x => map(x)),
                                    Horizontal(
                                        Button("Load More").onPromiseClick(() => this.loadMore())
                                    )
                                )
                                    .setGap("var(--gap)")
                                : Vertical(
                                    ...val.value.length == 0 ? [ this.placeholder ] : val.value.filter((_, i) => i).map(x => map(x)),
                                )
                                    .setGap("var(--gap)")

                        )
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
                        ...val.length == 0 ? [ this.placeholder ] : val.map(x => map(x)),
                        Reactive(this.paging, "enabled", () => this.paging.enabled ? Button("Load More").onPromiseClick(() => this.loadMore()) : Box()),
                    )
                        .setGap("var(--gap)")
                        .draw()
                );
        });
    }
    private canLoadMore(length: number) {
        return this.paging.enabled && length > this.paging.limit;
    }
    enablePaging(loadMore: () => Promise<void>) {
        this.paging.enabled = true;
        this.loadMore = loadMore;
        return this;
    }

    setPlaceholder(val: Component) {
        this.placeholder = val;
        return this;
    }
};

export const placeholder = (title: string, subtitle: string) => Vertical(
    PlainText(title)
        .addClass("list-title")
        .setMargin("0"),
    PlainText(subtitle),
).setGap("1rem");

export async function loadMore<T>(source: Pointer<External<T[]> | 'loading'>, func: (last: T) => Promise<External<T[]>>) {
    const data = source.value();
    if (data !== "loading" && data.status !== "rejected") {
        const rsp = await func(data.value.at(-1) ?? alert("Bad State: Entry is empty yet load more")!);
        if (rsp.status == "rejected")
            source.setValue(rsp);
        else
            source.setValue({
                status: "fulfilled",
                value: [ ...data.value, ...rsp.value ]
            });
    }
}

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