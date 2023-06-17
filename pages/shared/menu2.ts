import { assert } from "std/testing/asserts.ts";
import { asPointer, Component, Entry, Pointable, Pointer } from "webgen/mod.ts";
import { Link } from "../manager/misc/actionbar.ts";
import { HeavyList } from "./list.ts";

interface ClickHandler {
    (path: string, node: MenuNode): void | Promise<void>;
}

interface RenderItem extends Component, MenuNode { }

interface MenuNode {
    id: string;
    title: Pointable<string>;
    children?: Pointable<RenderItem[]>;
    clickHandler?: ClickHandler;
    firstRenderHandler?: ClickHandler;
    actions?: Pointable<Link[]>;
}

interface CategoryNode extends MenuNode {
    displayType?: "RootNode" | "CategoryNode";
}

type RootNode = Omit<MenuNode, "id"> & {
    categories?: CategoryNode[];
};

function traverseToMenuNode(rootNode: RootNode, path: string): RootNode | MenuNode | null {
    const pathSegments = path.split("/").filter(Boolean);

    let currentNode: RootNode | MenuNode | undefined = rootNode;

    for (const segment of pathSegments) {
        if (currentNode && 'categories' in currentNode && currentNode.categories) {
            const categoryNode: CategoryNode | undefined = currentNode.categories.find(
                (category) => category.id === segment
            );

            if (categoryNode) {
                currentNode = categoryNode;
                continue;
            }
        }

        if (currentNode?.children) {
            const childNode: RenderItem | undefined = asPointer(currentNode.children).getValue().find(
                (child) => child.id === segment
            );

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

export const Menu2 = (rootNode: RootNode) => new class extends Component {
    path = asPointer(rootNode.categories?.at(0) ? `${rootNode.categories.at(0)!.id}/` : "-/");
    displayed = asPointer([]) as Pointer<RenderItem[]>;


    constructor() {
        super();

        // Renderer
        this.wrapper.append(HeavyList(this.displayed, item => {
            if (item instanceof Component)
                return item;

            const entry = Entry(item);
            const click = this.createClickHandler(item);
            if (click)
                entry.onPromiseClick(click);
            return entry;
        }).draw());

        // Listener
        this.path.listen((val) => {
            const item = traverseToMenuNode(rootNode, val);

            assert(item, "No Node found");

            this.displayed.setValue(item.children instanceof Pointer ? item.children.getValue() : item.children ?? []);
        });

    }

    private createClickHandler(menu: MenuNode) {
        if (menu.children) return async () => {
            await true;
            this.path.setValue(this.path + "/" + menu.id + "/");
        };
        if (menu.clickHandler) return async () => {
            await menu.clickHandler?.(this.path.getValue() + "/" + menu.id + "/", menu);
            this.path.setValue(this.path + "/" + menu.id + "/");
        };
        return undefined;
    }
};