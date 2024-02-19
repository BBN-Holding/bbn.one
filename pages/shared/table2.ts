import { Box, Component, Custom, Label, Refable, Reference, asRef, refMerge } from "webgen/mod.ts";
import "./table2.css";

export type TableColumn<Data> = {
    converter: (data: Data) => Component;
    title: Reference<string>;
    sorting: Reference<TableSorting | undefined>;
};

export enum TableSorting {
    Descending = "descending",
    Ascending = "ascending",
    Available = "available"
}

export type RowClickHandler = (rowIndex: number, columnIndex: number) => void;
export type RowClickEnabledHandler = (rowIndex: number) => boolean;

export class Table2<Data> extends Component {
    private columns = asRef<TableColumn<Data>[]>([]);
    private hoveredRow = asRef<number | undefined>(undefined);
    private rowClick = asRef<RowClickHandler | undefined>(undefined);
    private rowClickable = asRef<RowClickEnabledHandler | undefined>(undefined);
    constructor(dataSource: Reference<Data[]>) {
        super();
        this.wrapper.append(this.columns.map(columns => Box(
            ...columns.map((column, columnIndex) => Box(
                this.header(column),
                dataSource.map(rows =>
                    Box(
                        ...rows.map((row, rowIndex) => {
                            const clickEnabled = this.rowClick.map(it => !!it && (this.rowClickable.getValue()?.(rowIndex) ?? true));
                            const hovering = refMerge({
                                clickEnabled,
                                hoveredRow: this.hoveredRow
                            });
                            const item = Box(column.converter(row))
                                .addClass(rowIndex % 2 == 0 ? "even" : "odd", "item", columnIndex == 0 ? "left" : (columnIndex == columns.length - 1 ? "right" : "middle"))
                                .addClass(hovering.map(({ clickEnabled, hoveredRow }) => clickEnabled && hoveredRow === rowIndex ? "hover" : "non-hover"))
                                .draw();
                            item.addEventListener("pointerenter", () => this.hoveredRow.setValue(rowIndex));
                            item.addEventListener("pointerleave", () => this.hoveredRow.setValue(undefined));
                            item.onclick = () => {
                                if (clickEnabled.getValue())
                                    this.rowClick.getValue()?.(rowIndex, columnIndex);
                            };
                            return Custom(item);
                        })
                    )
                        .removeFromLayout()
                )
                    .asRefComponent()
                    .removeFromLayout()
            ).addClass("column"))
        ).addClass("wgtable")).asRefComponent().draw());
    }

    setColumnTemplate(layout: Refable<string>) {
        asRef(layout).listen(value => {
            this.wrapper.style.setProperty("--wgtable-column-template", value);
        });
        return this;
    }

    addColumn(title: Reference<string> | string, converter: TableColumn<Data>[ "converter" ], sorting?: Reference<undefined | TableSorting> | undefined | TableSorting) {
        this.columns.setValue([ ...this.columns.getValue(), <TableColumn<Data>>{
            converter,
            title: asRef(title ?? ""),
            sorting: asRef(sorting)
        } ]);
        return this;
    }

    setRowClickEnabled(clickableHandler: Refable<RowClickEnabledHandler>) {
        asRef(clickableHandler).listen(value => this.rowClickable.setValue(value));
        return this;
    }

    setRowClick(clickHandler: Refable<RowClickHandler>) {
        asRef(clickHandler).listen(value => this.rowClick.setValue(value));
        return this;
    }

    private header(column: TableColumn<Data>) {
        return Box(
            Label(column.title)
        ).addClass("header");
    }
}