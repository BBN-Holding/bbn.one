import { Box, Component, Custom, Label, Pointable, Pointer, asPointer, refMerge } from "webgen/mod.ts";

export type TableColumn<Data> = {
    size: 'fill' | 'auto',
    converter: (data: Data) => Component;
    title: Pointer<string>;
    sorting: Pointer<TableSorting | undefined>;
};

export enum TableSorting {
    Descending = "descending",
    Ascending = "ascending",
    Available = "available"
}

export type RowClickHandler = (rowIndex: number, columnIndex: number) => void;

export class Table2<Data> extends Component {
    private columns: Pointer<TableColumn<Data>[]> = asPointer([]);
    private hoveredRow: Pointer<number | undefined> = asPointer(undefined);
    private rowClick: Pointer<RowClickHandler | undefined> = asPointer(undefined);
    constructor(dataSource: Pointer<Data[]>) {
        super();
        this.wrapper.append(this.columns.map(columns => Box(
            ...columns.map((column, columnIndex) => Box(
                this.header(column),
                dataSource.map(rows =>
                    Box(
                        ...rows.map((row, rowIndex) => {
                            const hovering = refMerge({
                                clickEnabled: this.rowClick.map(it => !!it),
                                hoveredRow: this.hoveredRow
                            });
                            const item = Box(column.converter(row))
                                .addClass(rowIndex % 2 == 0 ? "even" : "odd", "item", columnIndex == 0 ? "left" : (columnIndex == columns.length - 1 ? "right" : "middle"))
                                .addClass(hovering.map(({ clickEnabled, hoveredRow }) => clickEnabled && hoveredRow === rowIndex ? "hover" : "non-hover"))
                                .draw();
                            item.addEventListener("pointerenter", () => this.hoveredRow.setValue(rowIndex));
                            item.addEventListener("pointerleave", () => this.hoveredRow.setValue(undefined));
                            item.onclick = () => {
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

    setColumnTemplate(layout: Pointable<string>) {
        asPointer(layout).listen(value => {
            this.wrapper.style.setProperty("--wgtable-column-template", value);
        });
        return this;
    }

    addColumn(title: Pointer<string> | string, converter: TableColumn<Data>[ "converter" ], sorting?: Pointer<undefined | TableSorting> | undefined | TableSorting, size: TableColumn<Data>[ "size" ] = 'auto') {
        this.columns.setValue([ ...this.columns.getValue(), <TableColumn<Data>>{
            converter,
            size,
            title: asPointer(title ?? ""),
            sorting: asPointer(sorting)
        } ]);
        return this;
    }

    setRowClick(clickHandler: Pointable<RowClickHandler>) {
        asPointer(clickHandler).listen(value => this.rowClick.setValue(value));
        return this;
    }

    private header(column: TableColumn<Data>) {
        return Box(
            Label(column.title)
        ).addClass("header");
    }
}