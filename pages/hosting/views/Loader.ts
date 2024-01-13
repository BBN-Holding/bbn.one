import { asRef, Component, Reference } from "webgen/mod.ts";
import { CachedPages } from "webgen/network.ts";

export function Loader<T extends object>(object: CachedPages<T>, handler: (options: { items: Reference<T[]>; hasMore: Reference<boolean>; loadMore: () => Promise<void>; isLoading: Reference<boolean>; }) => Component) {
    const isLoading = asRef<boolean>(false);

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
