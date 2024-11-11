import { asRef, Grid, Label } from "webgen/mod.ts";
import "../../assets/css/main.css";

export const SliderInput = (label: string) =>
    new class extends InputForm<number> {
        input = createElement("input");
        valueRender = (value: number) => `${((value / Number(this.input.max || "100")) * 100).toFixed(0)} %`;

        constructor() {
            super();
            const val = asRef("");
            this.input.type = "range";
            this.input.classList.add("wslider");
            this.wrapper.append(
                Grid(
                    Grid(
                        Label(label).setTextSize("sm").setFontWeight("bold"),
                        // .removeWrap(),
                        val.map((val) => Label(val).setTextSize("sm").setFontWeight("bold")).value.addClass("same-height"),
                    )
                        .setTemplateColumns("max-content auto max-content")
                        .setPadding("0 0.2rem"),
                    Custom(this.input),
                ).setMargin("0 -0.1rem").draw(),
            );

            this.addEventListener("update", (event) => {
                const value = (<CustomEvent<number>> event).detail;
                if (value) {
                    this.wrapper.classList.add("has-value");
                }
                this.input.value = (value ?? 0).toString();
            });
            this.input.oninput = () => {
                val.setValue(this.valueRender(this.input.valueAsNumber));
            };
            this.input.onchange = () => {
                val.setValue(this.valueRender(this.input.valueAsNumber));
                this.setValue(this.input.valueAsNumber);
            };
            this.addEventListener("data", () => {
                val.value = this.valueRender(this.input.valueAsNumber);
            });

            this.dispatchEvent(new CustomEvent("data", {}));
        }

        setMax(val: number) {
            this.input.max = val.toString();
            return this;
        }

        setStep(val: number) {
            this.input.step = val.toString();
            return this;
        }

        setMin(val: number) {
            this.input.min = val.toString();
            return this;
        }

        setStyle(_style: ButtonStyle): this {
            throw new Error("Method not implemented.");
        }
        setColor(_color: Color): this {
            throw new Error("Method not implemented.");
        }
    }();
