/**
 * Menu will be put into WebGen.
 *
 * Blocker:
 * ActionBar should be put in WebGen first (requires rewrite)
 * Entry should be put in WebGen first (requires rewrite)
 * Add URL Router
 */

import { Component, Reactive, State, Vertical } from "webgen/mod.ts";
import { ActionBar, Link } from "../manager/misc/actionbar.ts";
import { Entry } from "../manager/misc/Entry.ts";

interface MenuItem {
    title: string;
    id: `${string}/`;
    subtitle?: string;

    items?: MenuItem[] | { [ group in string ]: MenuItem[] };
    action?: (clickPath: string, item: MenuItem) => Promise<void> | void;
    custom?: (clickPath: string) => Component;
}

const FilterLastItem = (_: MenuItem, index: number, list: MenuItem[]): boolean => index != list.length - 1;

export const Menu = (rootMenu: MenuItem) => new class extends Component {
    nav = State({
        active: <string>rootMenu.id
    });
    constructor() {
        super();
        this.wrapper.append(Reactive(this.nav, "active", () => this.walkMenu()).draw());
    }

    getActivePath() {
        const list = [ rootMenu ];
        for (const iterator of this.nav.active.match(/(\w+\/)/g) ?? []) {
            const last = list.at(-1)!;
            if (Array.isArray(last.items))
                list.push(last.items.find(x => x.id == iterator)!);
        }
        return list;
    }

    isRootNav() {
        return this.nav.active == rootMenu.id;
    }

    private walkMenu() {
        const activeEntries = this.getActivePath();
        const active = activeEntries.at(-1)!;

        const list = this.isRootNav() ? undefined : activeEntries.filter(FilterLastItem).map((x, i) => (<Link>{
            title: x.title,
            onclick: () => {
                this.nav.active = activeEntries.filter((_, index) => index <= i).map(x => x.id).join("");
            }
        }));
        if (Array.isArray(active.items) || !active.items)
            return Vertical(
                ActionBar(active.title, undefined, undefined, list),
                Vertical(
                    active.items?.map(menu => Entry(
                        menu.title,
                        menu.subtitle,
                        this.menuClickHandler(menu)
                    )) ?? []
                ).setGap("var(--gap)"),
                active.custom?.(activeEntries.map(x => x.id).join("") + active.id) ?? null
            );
        // TODO: Implement Categories
        return Vertical(
            ActionBar(active.title, Object.keys(active.items).map(group => ({
                title: group,
                selected: false,
                onclick: () => { },
            })))
        );
    }

    private menuClickHandler(menu: MenuItem) {
        if (menu.items) return () => {
            this.nav.active = this.nav.active + menu.id;
        };
        if (menu.action || menu.custom) return async () => {
            const clickPath = this.getActivePath().map(x => x.id).join("") + menu.id;
            await menu.action?.(clickPath, menu);
            if (menu.custom)
                this.nav.active = this.nav.active + menu.id;

        };
        return undefined;
    }
};