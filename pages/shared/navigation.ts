import { assert } from "std/testing/asserts.ts";
import { asPointer, Box, Component, Entry, Grid, Icon, isMobile, isPointer, PlainText, Pointable, Pointer, Taglist, Vertical } from "webgen/mod.ts";
import { HeavyList, HeavyReRender } from "./list.ts";
import './navigation.css';

interface ClickHandler {
    (path: string, node: MenuNode): void | Promise<void>;
}

type RenderItem = Component | MenuNode;

interface MenuNode {
    id: string;
    title: Pointable<string>;
    children?: Pointable<RenderItem[]>;
    clickHandler?: ClickHandler;
    firstRenderHandler?: ClickHandler;
}

interface CategoryNode extends MenuNode {
    displayTextInHeader?: "same" | "useRoot";
}

type RootNode = Omit<MenuNode, "id"> & {
    categories?: CategoryNode[];
    actions?: Pointable<Component[]>;
};

function traverseToMenuNode(rootNode: RootNode, path: string): MenuNode | null {
    const pathSegments = path.split("/").filter(Boolean);
    let currentNode: MenuNode | undefined = rootNode as MenuNode;

    for (const segment of pathSegments) {
        if (currentNode?.children) {
            const childNode = asPointer(currentNode.children).getValue().find(
                (child) => !(child instanceof Component) && child.id === segment
            ) as MenuNode | undefined;

            if (childNode) {
                currentNode = childNode;
                continue;
            }
        }

        // Node not found for the given segment
        return null;
    }

    return currentNode || null;
}

function resolvePathToNodes(rootNode: RootNode, path: string): MenuNode[] | null {
    const nodes: MenuNode[] = [];
    const pathSegments = path.split("/").filter(Boolean);
    let currentNode: MenuNode | undefined = rootNode as MenuNode;

    for (const segment of pathSegments) {
        if (currentNode?.children) {
            const childNode = asPointer(currentNode.children).getValue().find(
                (child) => !(child instanceof Component) && child.id === segment
            ) as MenuNode | undefined;

            if (childNode) {
                currentNode = childNode;
                nodes.push(currentNode);
                continue;
            }
        }
        assert(segment, `Missing path segment ${segment} for ${path}`);
    }

    return nodes;
}

function getMenuNodeByPrefix(rootNode: RootNode, rootId: string): MenuNode {
    // When no categories
    if (rootId == "-") return rootNode as MenuNode;

    // Use category as root
    assert(rootNode.categories);
    const categoryNode = rootNode.categories.find((category) => category.id === rootId);
    assert(categoryNode, "category not found");
    return categoryNode;
}

class MenuImpl extends Component {
    rootNode: RootNode;
    path: Pointer<string>;
    displayed = asPointer([]) as Pointer<RenderItem[]>;
    #header: Pointer<(data: this) => Component> = asPointer(defaultHeader);
    #footer: Pointer<(data: this) => Component> = asPointer(defaultFooter);

    constructor(rootNode: RootNode) {
        super();
        this.rootNode = rootNode;
        this.path = asPointer(rootNode.categories?.at(0) ? `${rootNode.categories.at(0)!.id}/` : "-/");
        // Renderer
        this.wrapper.append(Vertical(
            HeavyReRender(this.#header, it => it(this)).removeFromLayout(),
            HeavyList(this.displayed, item => {
                if (item instanceof Component)
                    return item;

                const entry = Entry(item);
                const click = this.createClickHandler(item);
                if (click)
                    entry.onPromiseClick(async () => await click());
                return entry;
            }),
            HeavyReRender(this.#footer, it => it(this)).removeFromLayout(),
        ).setGap("var(--gap)").draw());

        // Listener
        this.path.listen((val) => {
            const [ rootId ] = val.split("/");
            const unprefixed = val.replace(rootId, "");
            const root = getMenuNodeByPrefix(rootNode, rootId);
            assert(root);
            const item = traverseToMenuNode(root, unprefixed);

            assert(item, "No Node found");
            if (isPointer(item.children)) {
                item.children.listen((items) => {
                    if (val == this.path.getValue())
                        this.displayed.setValue(items);
                });
            } else
                this.displayed.setValue(item.children ?? []);
        });

    }

    private createClickHandler(menu: MenuNode): undefined | (() => Promise<void> | void) {
        if (menu.children) return () => {
            this.path.setValue(this.path.getValue() + menu.id + "/");
        };
        if (menu.clickHandler) return async () => {
            await menu.clickHandler?.(this.path.getValue() + menu.id + "/", menu);
            this.path.setValue(this.path.getValue() + menu.id + "/");
        };
        return undefined;
    }

    setHeader(header: (data: this) => Component) {
        this.#header.setValue(header);
    }

    setFooter(footer: (data: this) => Component) {
        this.#footer.setValue(footer);
    }
}

/**
 * A Extendable Declarative Pointable Navigation Component.
 * @param rootNode
 * @returns
 */
export const Navigation = (rootNode: RootNode) => new MenuImpl(rootNode);

function defaultHeader(menu: MenuImpl) {
    return HeavyReRender(isMobile, mobile => {
        const list = Vertical(
            createBreadcrumb(menu),
            createTagList(menu)
        ).setGap("var(--gap)");
        if (!mobile) return Grid(
            list,
            createActionList(menu)
        ).setRawColumns("auto max-content").setGap("var(--gap)").setAlign("center");
        return list;
    });
}

function defaultFooter(menu: MenuImpl) {
    return HeavyReRender(isMobile, mobile => mobile ? Box(createActionList(menu)).addClass("sticky-footer") : Box().removeFromLayout()).removeFromLayout();
}

function createActionList(menu: MenuImpl) {
    return HeavyReRender(menu.rootNode.actions, it => Grid(...(it ?? [])).addClass("action-list-bar"));
}

function createTagList(menu: MenuImpl) {
    if (!menu.rootNode.categories) return Box().removeFromLayout();
    const index = asPointer(menu.rootNode.categories.findIndex(it => it.id == menu.path.getValue().split("/").at(0)));
    index.listen((val, oldVal) => {
        if (oldVal != undefined)
            menu.path.setValue(menu.rootNode.categories![ val ].id + "/");
    });

    return HeavyReRender(menu.path.map(path => {
        const [ rootId ] = path.split("/");
        const unprefixed = path.replace(rootId, "");
        return unprefixed == "/";
    }), visable => visable && menu.rootNode.categories ? Taglist(menu.rootNode.categories.map(it => it.title), index) : Box().removeFromLayout()).removeFromLayout();
}

function createBreadcrumb(menu: MenuImpl) {
    return HeavyReRender(isMobile, mobile => {

        const history = menu.path.map(path => {
            const [ rootId ] = path.split("/");
            const unprefixed = path.replace(rootId, "");

            const root = getMenuNodeByPrefix(menu.rootNode, rootId);
            const items = resolvePathToNodes(root, unprefixed) ?? [];
            return [ root, ...items ];
        });
        function moveToPath(index: number) {
            menu.path.setValue(history.getValue().filter((_, i) => index >= i).map(it => it.id).join("/") + "/");
        }

        if (mobile)
            return HeavyReRender(history, it => {
                const last = it.at(-2);
                if (!last) return PlainText(parseTitle(menu.rootNode, it.at(-1)!, it.length - 1))
                    .addClass("label");
                return Box(
                    // TODO: Make this a bit smaller
                    Grid(
                        Icon("arrow_back_ios_new"),
                        PlainText(parseTitle(menu.rootNode, last, it.indexOf(last) + 1)).addClass("label"),
                    )
                        .addClass("history-entry", "mobile")
                        .onClick(() => moveToPath(it.indexOf(last))),
                    PlainText(parseTitle(menu.rootNode, it.at(-1)!, it.length - 1))
                        .addClass("label"),
                );
            }).addClass("history-list").removeFromLayout();
        return HeavyReRender(history, it => {
            return Grid(
                ...it.map((entry, index) =>
                    Box(
                        PlainText(entry.title).addClass("label"),
                        Icon("arrow_forward_ios")
                    )
                        .addClass("history-entry")
                        .onClick(() => moveToPath(index))
                ).filter((_, i) => i != it.length - 1),
                PlainText(parseTitle(menu.rootNode, it.at(-1)!, it.length - 1))
                    .addClass("label"),
            ).addClass("history-list");
        }).removeFromLayout();
    }
    ).removeFromLayout();
}

function parseTitle(rootNode: RootNode, node: MenuNode, index: number) {
    if (index === 0 && (<CategoryNode>node).displayTextInHeader != "same") return rootNode.title;
    return node.title;
}