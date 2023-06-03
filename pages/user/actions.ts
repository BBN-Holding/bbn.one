import { API, displayError } from "shared";
import { delay } from "std/async/delay.ts";
import { assert } from "std/testing/asserts.ts";
import { forceRefreshToken, gotoGoal } from "../manager/helper.ts";
import { state } from "./state.ts";

export async function loginUser() {
    try {
        assert(state.email && state.password, "Error: Please try again later");
        const rsp = await API.auth.email.post({
            email: state.email,
            password: state.password
        });
        if (rsp.status == "rejected")
            throw rsp.reason;

        await logIn(rsp.value, "email");
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
            name: state.name ?? ""
        };
        assert(name && email && password, "Missing fields");
        const rsp = await API.auth.register.post({
            name,
            email,
            password
        });
        if (rsp.status == "rejected")
            throw rsp.reason;

        await logIn(rsp.value, "email");
        gotoGoal();
    } catch (error) {
        state.error = displayError(error);
    }
}

export async function logIn(data: { token: string; }, mode: "email" | "0auth") {
    localStorage.removeItem("type");
    const access = await API.auth.refreshAccessToken.post(data.token);
    localStorage[ "access-token" ] = access.token;
    localStorage[ "refresh-token" ] = data!.token;
    localStorage[ "type" ] = mode;
}

export async function handleStateChange() {
    const para = new URLSearchParams(location.search);
    const params = {
        token: para.get("token"),
        type: para.get("type"),
        code: para.get("code")
    };

    if (params.type == "google" && params.code) {
        const rsp = await API.auth.google.post(params.code);
        if (rsp.status === "rejected")
            return state.error = displayError(rsp.reason);
        await logIn(rsp.value, "0auth");
        gotoGoal();
    }
    else if (params.type == "discord" && params.code) {
        const rsp = await API.auth.discord.post(params.code);
        if (rsp.status === "rejected")
            return state.error = displayError(rsp.reason);
        await logIn(rsp.value, "0auth");
        gotoGoal();
    }
    else if (params.type == "microsoft" && params.code) {
        const rsp = await API.auth.microsoft.post(params.code);
        if (rsp.status === "rejected")
            return state.error = displayError(rsp.reason);
        await logIn(rsp.value, "0auth");
        gotoGoal();
    }
    else if (params.type == "forgot-password" && params.token) {
        const rsp = await API.auth.fromUserInteraction.get(params.token);
        if (rsp.status === "rejected")
            return state.error = displayError(rsp.reason);
        await logIn(rsp.value, "email");
        state.token = API.getToken();
    }
    else if (params.type == "sign-up" && params.token) {
        const rsp = await API.user(API.getToken()).mail.validate.post(params.token);
        if (rsp.status === "rejected")
            return state.error = displayError(rsp.reason);
        await forceRefreshToken();
        await delay(1000);
        gotoGoal();
    }
    else
        state.type = "login";
}