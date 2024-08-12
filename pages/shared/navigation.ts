import { assert } from "@std/assert";
import { asRef, Box, Component, Empty, Entry, Grid, isMobile, isRef, Label, MIcon, Refable, Reference, Taglist, Vertical } from "webgen/mod.ts";
import { HeavyList } from "./list.ts";
import "./navigation.css";

export interface ClickHandler {
    (path: string, node: MenuNode): void | Promise<void>;
}

export type RenderItem = Component | MenuNode;

export interface MenuNode {
    id: string;
    hidden?: Refable<boolean>;
    title: Refable<string>;
    subtitle?: Refable<string>;
    children?: Refable<RenderItem[]>;
    replacement?: Refable<Component>;
    suffix?: Refable<Component>;
    clickHandler?: ClickHandler;
    firstRenderHandler?: ClickHandler;
}

export interface CategoryNode extends MenuNode {
    displayTextInHeader?: "same" | "useRoot";
}

export type RootNode = Omit<MenuNode, "id"> & {
    categories?: CategoryNode[];
    actions?: Refable<Component[]>;
};

function traverseToMenuNode(rootNode: RootNode, path: string): MenuNode | null {
    const pathSegments = path.split("/").filter(Boolean);
    let currentNode: MenuNode | undefined = rootNode as MenuNode;

    for (const segment of pathSegments) {
        if (currentNode?.children) {
            const childNode = asRef(currentNode.children).getValue().find(
                (child) => !(child instanceof Component) && child.id === segment,
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
            const childNode = asRef(currentNode.children).getValue().find(
                (child) => !(child instanceof Component) && child.id === segment,
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
    path: Reference<string>;
    displayed = asRef<RenderItem[]>([]);
    #header: Reference<(data: this) => Component> = asRef<(data: this) => Component>(defaultHeader);
    #footer: Reference<(data: this) => Component> = asRef<(data: this) => Component>(defaultFooter);

    constructor(rootNode: RootNode) {
        super();
        this.rootNode = rootNode;
        this.path = asRef(rootNode.categories?.at(0) ? `${rootNode.categories.at(0)!.id}/` : "-/");
        // Renderer
        this.wrapper.append(
            Vertical(
                this.#header.map((it) => it(this)).asRefComponent().removeFromLayout(),
                HeavyList<RenderItem>(this.displayed, (item) => {
                    if (item instanceof Component) {
                        return item;
                    }

                    if (asRef(item.hidden ?? false).getValue()) {
                        return Empty();
                    }

                    const entry = Entry(item.replacement ? asRef(item.replacement).getValue() : item).addClass(isMobile.map((mobile) => mobile ? "small" : "desktop"));
                    const click = this.#createClickHandler(item);
                    if (item.suffix) {
                        entry.addSuffix(asRef(item.suffix).getValue());
                    }
                    if (click) {
                        entry.onPromiseClick(async () => await click());
                    }
                    return entry;
                }),
                this.#footer.map((it) => it(this)).asRefComponent().removeFromLayout(),
            ).setGap().draw(),
        );

        // Listener
        this.path.listen((val) => {
            const [rootId] = val.split("/");
            const unprefixed = val.replace(rootId, "");
            const root = getMenuNodeByPrefix(rootNode, rootId);
            assert(root);
            const item = traverseToMenuNode(root, unprefixed);

            assert(item, "No Node found");
            if (isRef<RenderItem[]>(item.children)) {
                item.children.listen((items) => {
                    if (val == this.path.getValue()) {
                        this.displayed.setValue(items);
                    }
                });
            } else {
                this.displayed.setValue(item.children ?? []);
            }
        });
    }

    #createClickHandler(menu: MenuNode): undefined | (() => Promise<void> | void) {
        if (menu.clickHandler) {
            return async () => {
                await menu.clickHandler?.(`${this.path.getValue() + menu.id}/`, menu);
                if (menu.children) {
                    this.path.setValue(`${this.path.getValue() + menu.id}/`);
                }
            };
        }
        if (menu.children) {
            return () => {
                this.path.setValue(`${this.path.getValue() + menu.id}/`);
            };
        }
        return undefined;
    }

    setHeader(header: (data: this) => Component) {
        this.#header.setValue(header);
        return this;
    }

    setFooter(footer: (data: this) => Component) {
        this.#footer.setValue(footer);
    }
}

/**
 * A Extendable Declarative Refable Navigation Component.
 * @param rootNode
 * @returns
 */
export const Navigation = (rootNode: RootNode) => new MenuImpl(rootNode);

function defaultHeader(menu: MenuImpl) {
    return isMobile.map((mobile) => {
        const list = Vertical(
            createBreadcrumb(menu),
            createTagList(menu),
        ).setGap();
        if (!mobile) {
            return Grid(
                list,
                createActionList(menu),
            ).setRawColumns("auto max-content").setGap().setAlignItems("center");
        }
        return list;
    }).asRefComponent();
}

function defaultFooter(menu: MenuImpl) {
    return isMobile.map((mobile) => mobile && menu.rootNode.actions ? Box(createActionList(menu)).addClass(asRef(menu.rootNode.actions).map((it) => it.length == 0 ? "remove-from-layout" : "normal"), "sticky-footer") : Empty()).asRefComponent().removeFromLayout();
}

export function createActionList(menu: MenuImpl) {
    return asRef(menu.rootNode.actions ?? []).map((it) => Grid(...it).addClass("action-list-bar")).asRefComponent().removeFromLayout();
}

export function createTagList(menu: MenuImpl) {
    if (!menu.rootNode.categories) return Empty();
    const index = asRef(0);
    index.listen((val, oldVal) => {
        if (oldVal != undefined) {
            const path = menu.rootNode.categories![val];
            if (path) {
                menu.path.setValue(`${path.id}/`);
            }
        }
    });

    menu.path.listen((path) => {
        index.setValue(menu.rootNode.categories!.findIndex((it) => it.id == path.split("/").at(0)));
    });

    return menu.path.map((path) => {
        const [rootId] = path.split("/");
        const unprefixed = path.replace(rootId, "");
        const visible = unprefixed == "/";
        return visible && menu.rootNode.categories ? Taglist(menu.rootNode.categories.map((it) => it.title), index) : Empty();
    }).asRefComponent();
}

export function createBreadcrumb(menu: MenuImpl) {
    return isMobile.map((mobile) => {
        const history = menu.path.map((path) => {
            const [rootId] = path.split("/");
            const unprefixed = path.replace(rootId, "");

            const root = getMenuNodeByPrefix(menu.rootNode, rootId);
            const items = resolvePathToNodes(root, unprefixed) ?? [];
            return [root, ...items];
        });
        function moveToPath(index: number) {
            menu.path.setValue(`${history.getValue().filter((_, i) => index >= i).map((it) => it.id ?? "-").join("/")}/`);
        }

        if (mobile) {
            return history.map((it) => {
                const last = it.at(-2);
                if (!last) {
                    return Label(parseTitle(menu.rootNode, it.at(-1)!, it.length - 1))
                        .addClass("label");
                }
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
            }).asRefComponent().addClass("history-list").removeFromLayout();
        }
        return history.map((it) =>
            Grid(
                ...it.map((entry, index) =>
                    Box(
                        Label(entry.title)
                            .setFontWeight("bold")
                            .addClass("label"),
                        MIcon("arrow_forward_ios"),
                    )
                        .addClass("history-entry")
                        .onClick(() => moveToPath(index))
                ).filter((_, i) => i != it.length - 1),
                Label(parseTitle(menu.rootNode, it.at(-1)!, it.length - 1))
                    .addClass("label")
                    .setFontWeight("bold"),
            ).addClass("history-list")
        ).asRefComponent().removeFromLayout();
    }).asRefComponent().removeFromLayout();
}

function parseTitle(rootNode: RootNode, node: MenuNode, index: number) {
    if (index === 0 && (<CategoryNode> node).displayTextInHeader != "same") return rootNode.title;
    return node.title;
}
