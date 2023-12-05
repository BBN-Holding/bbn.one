import { asPointer, Component, Pointer } from "webgen/mod.ts";
import { CachedPages } from "webgen/network.ts";

export function Loader<T extends object>(object: CachedPages<T>, handler: (options: { items: Pointer<T[]>; hasMore: Pointer<boolean>; loadMore: () => Promise<void>; isLoading: Pointer<boolean>; }) => Component) {
    const isLoading = asPointer<boolean>(false);

    const loadMore = async () => {
        isLoading.setValue(true);
        await object.next();
        isLoading.setValue(false);
    };
    return handler({
        items: object.items,
        hasMore: object.hasMore,
        loadMore,
        isLoading
    });
}
