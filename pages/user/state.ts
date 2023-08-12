import { State } from "webgen/mod.ts";

type ViewType = 'loading' | 'request-reset-password' | 'reset-password-from-email' | 'login' | "register";

export const state = State({
    type: <ViewType>"loading",
    name: <string | undefined>undefined,
    email: <string | undefined>undefined,
    password: <string | undefined>undefined,
    error: <string | undefined>undefined,
});