import { assert } from "std/assert/assert.ts";
import { Box, Component, Entry, Grid, Label, MIcon, Pointable, Pointer, Taglist, Vertical, asPointer, isMobile, isPointer } from "webgen/mod.ts";
import { HeavyList, HeavyReRender } from "./list.ts";
import './navigation.css';

export interface ClickHandler {
    (path: string, node: MenuNode): void | Promise<void>;
}

export type RenderItem = Component | MenuNode;

export interface MenuNode {
    id: string;
    hidden?: Pointable<boolean>;
    title: Pointable<string>;
    subtitle?: Pointable<string>;
    children?: Pointable<RenderItem[]>;
    replacement?: Pointable<Component>;
    suffix?: Pointable<Component>;
    clickHandler?: ClickHandler;
    firstRenderHandler?: ClickHandler;
}

export interface CategoryNode extends MenuNode {
    displayTextInHeader?: "same" | "useRoot";
}

export type RootNode = Omit<MenuNode, "id"> & {
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

                if (asPointer(item.hidden).getValue())
                    return Box().removeFromLayout();

                const entry = Entry(item.replacement ? asPointer(item.replacement).getValue() : item).addClass(isMobile.map(mobile => mobile ? "small" : "desktop"));
                const click = this.createClickHandler(item);
                if (item.suffix)
                    entry.addSuffix(asPointer(item.suffix).getValue());
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
        if (menu.clickHandler) return async () => {
            await menu.clickHandler?.(`${this.path.getValue() + menu.id}/`, menu);
            if (menu.children)
                this.path.setValue(`${this.path.getValue() + menu.id}/`);
        };
        if (menu.children) return () => {
            this.path.setValue(`${this.path.getValue() + menu.id}/`);
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
    return HeavyReRender(isMobile, mobile => mobile && menu.rootNode.actions ? Box(createActionList(menu)).addClass(asPointer(menu.rootNode.actions).map(it => it.length == 0 ? "remove-from-layout" : "normal"), "sticky-footer") : Box().removeFromLayout()).removeFromLayout();
}

function createActionList(menu: MenuImpl) {
    return HeavyReRender(menu.rootNode.actions, it => Grid(...(it ?? [])).addClass("action-list-bar")).removeFromLayout();
}

function createTagList(menu: MenuImpl) {
    if (!menu.rootNode.categories) return Box().removeFromLayout();
    const index = asPointer(0);
    index.listen((val, oldVal) => {
        if (oldVal != undefined) {
            const path = menu.rootNode.categories![ val ];
            if (path)
                menu.path.setValue(`${path.id}/`);
        }
    });

    menu.path.listen(path => {
        index.setValue(menu.rootNode.categories!.findIndex(it => it.id == path.split("/").at(0)));
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
            menu.path.setValue(`${history.getValue().filter((_, i) => index >= i).map(it => it.id ?? "-").join("/")}/`);
        }

        if (mobile)
            return HeavyReRender(history, it => {
                const last = it.at(-2);
                if (!last) return Label(parseTitle(menu.rootNode, it.at(-1)!, it.length - 1))
                    .addClass("label");
                return Box(
                    // TODO: Make this a bit smaller
                    Grid(
                        MIcon("arrow_back_ios_new"),
                        Label(parseTitle(menu.rootNode, last, it.indexOf(last) + 1)).addClass("label"),
                    )
                        .addClass("history-entry", "mobile")
                        .onClick(() => moveToPath(it.indexOf(last))),
                    Label(parseTitle(menu.rootNode, it.at(-1)!, it.length - 1))
                        .addClass("label"),
                );
            }).addClass("history-list").removeFromLayout();
        return HeavyReRender(history, it => Grid(
            ...it.map((entry, index) =>
                Box(
                    Label(entry.title).addClass("label"),
                    MIcon("arrow_forward_ios")
                )
                    .addClass("history-entry")
                    .onClick(() => moveToPath(index))
            ).filter((_, i) => i != it.length - 1),
            Label(parseTitle(menu.rootNode, it.at(-1)!, it.length - 1))
                .addClass("label"),
        ).addClass("history-list")).removeFromLayout();
    }
    ).removeFromLayout();
}

function parseTitle(rootNode: RootNode, node: MenuNode, index: number) {
    if (index === 0 && (<CategoryNode>node).displayTextInHeader != "same") return rootNode.title;
    return node.title;
}