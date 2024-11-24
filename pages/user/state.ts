import { asRefRecord } from "webgen/mod.ts";

type ViewType = "loading" | "request-reset-password" | "reset-password-from-email" | "login" | "register";

export const state = asRefRecord({
    type: <ViewType> "loading",
    name: "",
    email: "",
    password: "",
    error: <string | undefined> undefined,
});
