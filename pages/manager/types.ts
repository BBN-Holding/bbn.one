import { Drop } from "../../spec/music.ts";

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

export type ViewState = {
    list: Drop[];
    type: Drop[ "type" ];
};
