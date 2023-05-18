import { assert } from "std/testing/asserts.ts";
import { API } from "../manager/RESTSpec.ts";
import { state } from "./state.ts";
import { forceRefreshToken, gotoGoal } from "../manager/helper.ts";
import { delay } from "std/async/delay.ts";

export async function loginUser() {
    try {
        assert(state.email && state.password, "Error: Please try again later");
        const rsp = await API.auth.email.post({
            email: state.email,
            password: state.password
        });
        if (API.isError(rsp))
            state.error = rsp.message || "";

        else
            logIn(rsp, "email").finally(gotoGoal);
    } catch (error) {
        state.error = error.message;
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
        if (API.isError(rsp))
            state.error = rsp.message || "";

        else
            logIn(rsp, "email").finally(gotoGoal);
    } catch (error) {
        state.error = error.message;
    }
}

export async function logIn(data: { token: string; }, mode: "email" | "0auth") {
    localStorage.removeItem("type");
    const access = await API.auth.refreshAccessToken.post({ refreshToken: data.token });
    localStorage[ "access-token" ] = access.token;
    localStorage[ "refresh-token" ] = data!.token;
    localStorage[ "type" ] = mode;
}

export async function handleStateChange() {
    const para = new URLSearchParams(location.search);
    const params = {
        token: para.get("token"),
        type: para.get("type"),
        stateCode: para.get("state"),
        code: para.get("code")
    };


    if (params.type == "google" && params.stateCode && params.code) {
        API.auth.google.post({ code: params.code, state: params.stateCode })
            .then(x => logIn(x, "0auth"))
            .then(gotoGoal);
    }
    else if (params.type == "discord" && params.stateCode && params.code) {
        API.auth.discord.post({ code: params.code, state: params.stateCode })
            .then(x => logIn(x, "0auth"))
            .then(gotoGoal);
    }
    else if (params.type == "forgot-password" && params.token) {
        API.auth.fromUserInteraction.get("JWT " + params.token).then(async x => {
            await logIn(x, "email");
            state.token = API.getToken();
        }).catch(() => {
            state.error = "Error: Something happend unexpectedly";
        });
    }
    else if (params.type == "sign-up" && params.token) {
        await API.user(API.getToken()).mail.validate.post(params.token);
        await forceRefreshToken();
        await delay(1000);
        gotoGoal();
    }
    else
        state.type = "login";
}