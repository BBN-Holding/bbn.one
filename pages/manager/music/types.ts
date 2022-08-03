import { Drop } from "../RESTSpec.ts";

export type EditViewState = {
    data: Drop,
    route: "edit-drop" | "main";
};