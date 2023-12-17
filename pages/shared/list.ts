import { Box, Button, CenterV, Component, Horizontal, Label, MIcon, Pointable, Pointer, State, Vertical, asPointer } from "webgen/mod.ts";
import { LoadingSpinner } from "./components.ts";
import { External, displayError } from "./restSpec.ts";

// TODO: don't rerender the complete list on update. virtual list?
export const HeavyList = <T>(items: Pointable<External<T[]> | 'loading' | T[]>, map: (val: T) => Component) => new class extends Component {
    placeholder = Box();
    loadMore = async (_offset: number, _limit: number) => { };
    paging = State({ enabled: false, limit: 30 });

    constructor() {
        super();
        console.debug("HeavyList got constructed");
        const list = asPointer(items);
        list.listen((val: External<T[]> | 'loading' | T[]) => {
            this.wrapper.textContent = '';
            if (val === "loading")
                this.wrapper.append(
                    LoadingSpinner().draw()
                );
            else if ('status' in val) {
                if (val.status === "fulfilled")
                    this.wrapper.append(
                        this.paging.$enabled.map(() => this.canLoadMore(val.value.length)
                            ? Vertical(
                                ...val.value.length == 0 ? [ this.placeholder ] : val.value.map(x => map(x))
                                    .filter((_, index) => index % this.paging.limit !== 1),
                                Horizontal(
                                    Button("Load More").onPromiseClick(() => this.loadMore(val.value.length, this.paging.limit))
                                )
                                    .setMargin("0 0 var(--gap)")
                            )
                                .setGap("var(--gap)")
                            : Vertical(
                                ...val.value.length == 0 ? [ this.placeholder ] : val.value.map(x => map(x)),
                            )
                                .setGap("var(--gap)")

                        )
                            .asRefComponent()
                            .draw()
                    );
                else
                    this.wrapper.append(
                        Horizontal(
                            Vertical(
                                MIcon("error"),
                                Label(displayError(val.reason))
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
                        this.paging.$enabled.map(() => this.paging.enabled ? Button("Load More").setMargin("0 0 var(--gap)").onPromiseClick(() => this.loadMore(val.length - 2, this.paging.limit + 1)) : Box().removeFromLayout()).asRefComponent().removeFromLayout(),
                    )
                        .setGap("var(--gap)")
                        .draw()
                );
        });
    }
    private canLoadMore(length: number) {
        return this.paging.enabled && (length % this.paging.limit == 1);
    }
    enablePaging(loadMore: (offset: number, limit: number) => Promise<void>, limit = 30) {
        this.paging.enabled = true;
        this.paging.limit = limit;
        this.loadMore = loadMore;
        return this;
    }

    setPlaceholder(val: Component) {
        this.placeholder = val;
        return this;
    }
};

export const placeholder = (title: string, subtitle: string) => CenterV(
    Label(title)
        .setTextSize("4xl")
        .setFontWeight("bold")
        .addClass("list-title"),
    Label(subtitle)
        .setTextSize("xl")
).setMargin("100px 0 0").setGap("1rem").setAttribute("align", "center");

export async function loadMore<T>(source: Pointer<External<T[]> | 'loading'>, func: () => Promise<External<T[]>>) {
    const data = source.getValue();
    if (data !== "loading" && data.status !== "rejected") {
        const rsp = await func();
        if (rsp.status == "rejected")
            source.setValue(rsp);
        else
            source.setValue({
                status: "fulfilled",
                value: [ ...data.value, ...rsp.value ]
            });
    }
}