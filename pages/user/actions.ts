import { assert } from "@std/assert";
import { delay } from "@std/async";
import { API, displayError, stupidErrorAlert } from "shared/mod.ts";
import { forceRefreshToken, gotoGoal } from "../shared/helper.ts";
import { state } from "./state.ts";

export async function loginUser() {
    try {
        assert(state.email && state.password, "Missing Email or Password");
        const rsp = await API.auth.email.post({
            email: state.email,
            password: state.password,
        });
        if (rsp.status == "rejected") {
            throw rsp.reason;
        }

        await logIn(rsp.value);
        gotoGoal();
    } catch (error) {
        state.error = displayError(error);
    }
}

export async function registerUser() {
    try {
        const { name, email, password } = {
            email: state.email ?? "",
            password: state.password ?? "",
            name: state.name ?? "",
        };
        assert(name && email && password, "Missing fields");
        const rsp = await API.auth.register.post({
            name,
            email,
            password,
        });
        if (rsp.status == "rejected") {
            throw rsp.reason;
        }

        await logIn(rsp.value);
        gotoGoal();
    } catch (error) {
        state.error = displayError(error);
    }
}

export async function logIn(data: { token: string }) {
    const access = await API.auth.refreshAccessToken.post(data.token).then(stupidErrorAlert);
    localStorage["access-token"] = access.token;
    localStorage["refresh-token"] = data.token;
}

export async function handleStateChange() {
    const para = new URLSearchParams(location.search);
    const params = {
        token: para.get("token"),
        type: para.get("type"),
        code: para.get("code"),
    };

    if (params.type && ["google", "discord", "microsoft"].includes(params.type) && params.code) {
        const rsp = await API.auth.oauth.post(params.type, params.code);
        if (rsp.status === "rejected") {
            return state.error = displayError(rsp.reason);
        }
        await logIn(rsp.value);
        gotoGoal();
        return;
    }
    if (params.type == "reset-password" && params.token) {
        const rsp = await API.auth.fromUserInteraction.get(params.token);
        if (rsp.status === "rejected") {
            return state.error = displayError(rsp.reason);
        }
        await logIn(rsp.value);
        gotoGoal();
        return;
    }
    if (params.type == "verify-email" && params.token) {
        const rsp = await API.user.mail.validate.post(params.token);
        if (rsp.status === "rejected") {
            return state.error = displayError(rsp.reason);
        }
        await forceRefreshToken();
        await delay(1000);
        gotoGoal();
        return;
    }
    state.type = "login";
}
