import { Component } from "../../deps.ts";

export type TableData = {
    Id: string;
    "Primary Genre"?: string;
    "Secondary Genre"?: string;
    Artists?: string;
    Country?: string;
    Explicit?: boolean;
    Name?: string;
    Year?: number;
};

export type ColumEntry<Data, Entry = keyof Data> = [ id: Entry, size: string, render: (data: Data, index: number) => Component ];
