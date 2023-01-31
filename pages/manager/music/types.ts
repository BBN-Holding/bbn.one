import { Drop } from "../../../spec/music.ts";

export type EditViewState = {
    data: Drop,
    route: "edit-drop" | "edit-songs" | "main";
};