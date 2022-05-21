import { Component } from "../../deps.ts";

export type TableData = {
    Id: string;
    Title?: string;
    PrimaryGenre?: string;
    SecondaryGenre?: string;
    Artists?: string;
    Country?: string;
    Explicit?: boolean;
    Year?: number;
};

export type ColumEntry<Data, Entry = keyof Data> = [ id: Entry, size: string, render: (data: Data, index: number) => Component ];
