import { Drop } from "../RESTSpec.ts";

export type EditViewState = {
    data: Drop,
    mode: "edit-drop" | "main";
};