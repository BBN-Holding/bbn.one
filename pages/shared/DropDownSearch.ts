import { asRef, Box, Button, ButtonComponent, ButtonStyle, Color, Component, createElement, Grid, InputForm, Items, Layer, MIcon, Refable, TextInput } from "webgen/mod.ts";
import { Popover } from "webgen/src/components/Popover.ts";

export const DropDownSearch = (label: string, list: Refable<string[]>) => new DropDownSearchComponent(list, label);

const content = asRef(Box());
const dropDownPopover = Popover(
    Layer(
        content.asRefComponent(),
        5,
    ).setBorderRadius("mid").addClass("wdropdown-outer-layer"),
)
    .pullingAnchorPositioning("--wdropdown-default", (rect, style) => {
        style.top = `max(-5px, ${rect.bottom}px)`;
        style.left = `${rect.left}px`;
        style.minWidth = `${rect.width}px`;
        style.bottom = "var(--gap)";
    });

export class DropDownSearchComponent<Value extends string> extends InputForm<Value> {
    prog = createElement("div");
    text = createElement("span");
    button: ButtonComponent;
    constructor(dropdown: Refable<string[]>, label: Refable<string | Component>, icon = MIcon("keyboard_arrow_down")) {
        super();

        const text = asRef(label);
        this.button = Button(text)
            .setWidth("100%")
            .setJustifyContent("space-between")
            .addSuffix(icon);

        const search = asRef("");

        this.wrapper.innerHTML = "";
        this.color.setValue(Color.Disabled);
        this.wrapper.append(this.button.draw());
        this.wrapper.classList.add("wdropdown");

        this.addEventListener("update", (event) => {
            const data = (<CustomEvent<Value>> event).detail;
            text.setValue(data == undefined ? asRef(label).getValue() : this.valueRender(data));
            dropDownPopover.hidePopover();
        });

        this.button.onClick(() => {
            if (dropDownPopover.togglePopover()) {
                console.log("shown");
                dropDownPopover.clearAnchors("--wdropdown-default");
                this.button.setAnchorName("--wdropdown-default");
            } else {
                console.log("clear");
            }
            //  dropDownPopover.showPopover();
            content.setValue(
                Grid(
                    TextInput("text", "Search")
                        .onChange((x) => search.setValue(x!))
                        //idk if that's a real 10/10 solution
                        .setAttribute("style", "z-index: 0"),
                    search.map((s) =>
                        Items(asRef(dropdown).map((x) => x.filter((y) => y.includes(s))), (item) =>
                            Button(this.valueRender(item as Value))
                                .setStyle(ButtonStyle.Inline)
                                .onClick(() => {
                                    this.setValue(item as Value);
                                }))
                    ).asRefComponent(),
                )
                    .addClass("wdropdown-content")
                    .setDirection("row")
                    .setGap("5px")
                    .setPadding("5px"),
            );
        });
    }
    setStyle(style: ButtonStyle, progress?: number) {
        this.button.setStyle(style, progress);
        return this;
    }
}
