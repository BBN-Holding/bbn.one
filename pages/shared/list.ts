// import { asRef, asState, Box, Button, CenterV, Component, Empty, Horizontal, Label, MIcon, Refable, Reference, Vertical } from "webgen/mod.ts";
// import { LoadingSpinner } from "./components.ts";
// import { displayError, External } from "./restSpec.ts";

// // TODO: don't rerender the complete list on update. virtual list?
// export const HeavyList = <T>(items: Refable<External<T[]> | "loading" | T[]>, map: (val: T) => Component) =>
//     new class extends Component {
//         placeholder = Box();
//         loadMore = async (_offset: number, _limit: number) => {};
//         paging = asState({ enabled: false, limit: 30 });

//         constructor() {
//             super();
//             console.debug("HeavyList got constructed");
//             const list = asRef(items);
//             list.listen((val: External<T[]> | "loading" | T[]) => {
//                 this.wrapper.textContent = "";
//                 if (val === "loading") {
//                     this.wrapper.append(
//                         LoadingSpinner().draw(),
//                     );
//                 } else if ("status" in val) {
//                     if (val.status === "fulfilled") {
//                         this.wrapper.append(
//                             this.paging.$enabled.map(() =>
//                                 this.#canLoadMore(val.value.length)
//                                     ? Vertical(
//                                         ...val.value.length == 0 ? [this.placeholder] : val.value.map((x) => map(x))
//                                             .filter((_, index) => index % this.paging.limit !== 1),
//                                         Horizontal(
//                                             Button("Load More").onPromiseClick(() => this.loadMore(val.value.length, this.paging.limit)),
//                                         )
//                                             .setMargin("0 0 var(--gap)"),
//                                     )
//                                         .setGap()
//                                     : Vertical(
//                                         ...val.value.length == 0 ? [this.placeholder] : val.value.map((x) => map(x)),
//                                     )
//                                         .setGap()
//                             )
//                                 .asRefComponent()
//                                 .draw(),
//                         );
//                     } else {
//                         this.wrapper.append(
//                             Horizontal(
//                                 Vertical(
//                                     MIcon("error"),
//                                     Label(displayError(val.reason)),
//                                 )
//                                     .setAlignItems("center")
//                                     .setGap("calc(var(--gap) * 0.25)")
//                                     .addClass("error-message"),
//                             )
//                                 .draw(),
//                         );
//                     }
//                 } else {
//                     this.wrapper.append(
//                         Vertical(
//                             ...val.length == 0 ? [this.placeholder] : val.map((x) => map(x)),
//                             this.paging.$enabled.map(() => this.paging.enabled ? Button("Load More").setMargin("0 0 var(--gap)").onPromiseClick(() => this.loadMore(val.length - 2, this.paging.limit + 1)) : Empty()).asRefComponent().removeFromLayout(),
//                         )
//                             .setGap()
//                             .draw(),
//                     );
//                 }
//             });
//         }
//         #canLoadMore(length: number) {
//             return this.paging.enabled && (length % this.paging.limit == 1);
//         }
//         enablePaging(loadMore: (offset: number, limit: number) => Promise<void>, limit = 30) {
//             this.paging.enabled = true;
//             this.paging.limit = limit;
//             this.loadMore = loadMore;
//             return this;
//         }

//         setPlaceholder(val: Component) {
//             this.placeholder = val;
//             return this;
//         }
//     }();

// export const placeholder = (title: string, subtitle: string) =>
//     CenterV(
//         Label(title)
//             .setTextSize("4xl")
//             .setFontWeight("bold")
//             .addClass("list-title"),
//         Label(subtitle)
//             .setTextSize("xl"),
//     ).setMargin("100px 0 0").setGap("1rem").setAttribute("align", "center");

// export async function loadMore<T>(source: Reference<External<T[]> | "loading">, func: () => Promise<External<T[]>>) {
//     const data = source.getValue();
//     if (data !== "loading" && data.status !== "rejected") {
//         const rsp = await func();
//         if (rsp.status == "rejected") {
//             source.setValue(rsp);
//         } else {
//             source.setValue({
//                 status: "fulfilled",
//                 value: [...data.value, ...rsp.value],
//             });
//         }
//     }
// }
