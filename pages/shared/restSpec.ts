import { BugReport, Drop, DropType, File, Group, Meta, OAuthApp, Payout, RequestPayoutResponse, Server, ServerAudit, ServerCreate, ServerTypes, StoreItems, Transcript, Wallet } from "../../spec/music.ts";
import { ProfileData } from "../_legacy/helper.ts";

export const Permissions = [
    "/hmsys",
    "/hmsys/user",
    "/hmsys/user/manage",

    "/bbn",
    "/bbn/hosting",
    "/bbn/manage",
    "/bbn/manage/drops",
    "/bbn/manage/drops/review",
    "/bbn/manage/payouts",
] as const;

export type Permission = typeof Permissions[ number ];
export type External<T> = PromiseSettledResult<T>;

export async function asExternal<T>(promise: Promise<T>): Promise<PromiseSettledResult<T>> {
    try {
        return {
            status: "fulfilled",
            value: await promise
        };
    } catch (e) {
        return {
            status: "rejected",
            reason: e
        };
    }
}

function json<T>() {
    return async (rsp: Response) => {
        if (!rsp.ok)
            return await asExternal(Promise.reject(await rsp.text()));
        return await asExternal(rsp.json() as Promise<T>);
    };
}

function none() {
    return async (rsp: Response) => {
        if (!rsp.ok)
            return await asExternal(Promise.reject(await rsp.text()));
        return await asExternal(Promise.resolve(true));
    };
}

function blob() {
    return async (rsp: Response) => {
        if (!rsp.ok)
            return await asExternal(Promise.reject(await rsp.text()));
        return await asExternal(rsp.blob());
    };
}

export function stupidErrorAlert<T>(data: PromiseSettledResult<T>): T {
    if (data.status === "fulfilled")
        return data.value;
    alert(displayError(data.reason));
    throw data.reason;
}


function reject(rsp: unknown) {
    return asExternal(Promise.reject(rsp));
}

export const defaultError = "Something happend unexpectedly. Please try again later.";

// This is very limited make error handling more useful.
export function displayError(data: unknown) {
    console.error("displayError", data);
    if (data instanceof Error) {
        if (data.message === "Failed to fetch")
            return "Error: Can't load. Please try again later.";
        if (data.message)
            return `Error: ${data.message}`;
    }
    if (typeof data === "string") {
        try {
            const jdata = JSON.parse(data) as unknown;
            // display assert errors that have a message
            if (jdata && typeof jdata === "object" && 'type' in jdata && 'message' in jdata && jdata.type === "assert" && jdata.message) return `Error: ${jdata.message}`;
        } catch (_e) {
            //
        }
    }
    return `Error: ${defaultError}`;
}

export const API = {
    getToken: () => localStorage[ "access-token" ],
    BASE_URL: <string>localStorage.OVERRIDE_BASE_URL || (location.hostname == "bbn.one" ? "https://bbn.one/api/@bbn/" : "http://localhost:8443/api/@bbn/"),
    WS_URL: <string>localStorage.OVERRIDE_WS_URL || (location.hostname == "bbn.one" ? "wss://bbn.one/ws" : "ws://localhost:8443/ws"),
    bugReport: (bugReport: BugReport) => fetch(`${API.BASE_URL}bug-track/`, {
        method: "POST",
        body: JSON.stringify(bugReport)
    }),
    isPermited: (requiredPermissions: Permission[], userPermission: Permission[]) => requiredPermissions.every(required => userPermission.find(user => required.startsWith(user))),
    user: {
        mail: {
            validate: {
                post: (token: string) => fetch(`${API.BASE_URL}user/mail/validate/${token}`, {
                    method: "POST",
                    headers: headers(API.getToken()),
                }).then(none())
            },
            resendVerifyEmail: {
                post: () => fetch(`${API.BASE_URL}user/mail/resend-verify-email`, {
                    method: "POST",
                    headers: headers(API.getToken()),
                }).then(none())
            }
        },
        setMe: {
            post: (para: Partial<{ name: string, email: string, password: string; }>) => fetch(`${API.BASE_URL}user/set-me`, {
                method: "POST",
                headers: headers(API.getToken()),
                body: JSON.stringify(para)
            })
                .then(none())
                .catch(reject)
        }
    },
    auth: {
        oauthRedirect: (type: "discord" | "google" | "microsoft") => `${API.BASE_URL}auth/redirect/${type}?goal=${localStorage.getItem('goal') ?? '/music'}`,
        refreshAccessToken: {
            post: (refreshToken: string) => fetch(`${API.BASE_URL}auth/refresh-access-token`, {
                method: "POST",
                headers: headers(refreshToken)
            })
                .then(json<{ token: string; }>())
                .catch(reject)
        },
        oauth: {
            post: (provider: string, code: string) => {
                const param = new URLSearchParams({ code });
                return fetch(`${API.BASE_URL}auth/oauth/${provider}?${param.toString()}`, {
                    method: "POST"
                })
                    .then(json<{ token: string; }>())
                    .catch(reject);
            }
        },
        fromUserInteraction: {
            get: (id: string) => fetch(`${API.BASE_URL}auth/from-user-interaction/${id}`)
                .then(json<{ token: string; }>())
                .catch(reject)
        },
        forgotPassword: {
            post: (email: string) => fetch(`${API.BASE_URL}auth/reset-password`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email
                })
            })
                .then(none())
        },
        register: {
            post: (data: { email: string, password: string, name: string; }) => fetch(`${API.BASE_URL}auth/register`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(data)
            })
                .then(json<{ token: string; }>())
                .catch(reject)
        },
        email: {
            post: (data: { email: string, password: string; }) => fetch(`${API.BASE_URL}auth/email`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(data)
            })
                .then(json<{ token: string; }>())
                .catch(reject)
        }
    },
    wallet: ({
        get: () => fetch(`${API.BASE_URL}wallet/`, {
            headers: headers(API.getToken())
        })
            .then(json<Wallet>())
            .catch(reject),
        requestPayout: (amount: number) => fetch(`${API.BASE_URL}wallet/`, {
            method: "PUT",
            headers: headers(API.getToken()),
            body: JSON.stringify({ amount })
        })
            .then(json<RequestPayoutResponse>())
            .catch(reject)
    }),
    oauth: ({
        validate: (id: string, scope: string, redirect_uri: string) => fetch(`${API.BASE_URL}oauth/validate`, {
            method: "POST",
            headers: headers(API.getToken()),
            body: JSON.stringify({ id, scope, redirect_uri })
        })
            .then(json<{ name: string; icon: string; authorized: boolean; }>())
            .catch(reject),
        authorize: (id: string, scope: string, redirect_uri: string) => fetch(`${API.BASE_URL}oauth/authorize`, {
            method: "POST",
            headers: headers(API.getToken()),
            body: JSON.stringify({ id, scope, redirect_uri })
        })
            .then(json<{ authorized: boolean; }>())
            .catch(reject),
        list: () => fetch(`${API.BASE_URL}oauth/applications`, {
            headers: headers(API.getToken())
        })
            .then(json<OAuthApp[]>())
            .catch(reject),
        post: (name: string, redirect: string[], icon: string) => fetch(`${API.BASE_URL}oauth/applications`, {
            method: "POST",
            headers: headers(API.getToken()),
            body: JSON.stringify({ name, redirect, icon })
        })
            .then(json<{ id: string, secret: string; }>())
            .catch(reject),
        icon: (clientid: string) => fetch(`${API.BASE_URL}oauth/applications/${clientid}/download`, {
            headers: headers(API.getToken())
        })
            .then(blob()),
        delete: (clientid: string) => fetch(`${API.BASE_URL}oauth/applications/${clientid}`, {
            method: "DELETE",
            headers: headers(API.getToken())
        })
            .then(none())
    }),
    admin: ({
        files: {
            list: (offset: number | undefined = undefined) => {
                const paging = new URLSearchParams();
                if (offset)
                    paging.append("_offset", offset.toString());
                paging.append("_limit", "31");
                return fetch(`${API.BASE_URL}admin/files?${paging}`, {
                    headers: headers(API.getToken())
                })
                    .then(json<File[]>())
                    .catch(reject);
            },
            download: (id: string) => fetch(`${API.BASE_URL}admin/files/${id}/download`, {
                headers: headers(API.getToken())
            })
                .then(blob())
                .catch(reject),
            delete: (id: string) => fetch(`${API.BASE_URL}admin/files/${id}`, {
                method: "DELETE",
                headers: headers(API.getToken())
            })
                .then(none())
                .catch(reject)
        },
        drops: {
            list: (type?: DropType, offset = 0, limit = 31) => {
                const paging = new URLSearchParams();
                if (type)
                    paging.append("type", type);
                paging.append("_offset", offset.toString());
                paging.append("_limit", limit.toString());
                return fetch(`${API.BASE_URL}admin/drops?${paging}`, {
                    headers: headers(API.getToken())
                })
                    .then(json<Drop[]>())
                    .catch(reject);
            },
            user: (id: string) => {
                return fetch(`${API.BASE_URL}admin/drops?user=${id}`, {
                    headers: headers(API.getToken())
                })
                    .then(json<Drop[]>())
                    .catch(reject);
            },
            id: (id: string) => {
                return fetch(`${API.BASE_URL}admin/drops/${id}`, {
                    headers: headers(API.getToken())
                })
                    .then(json<Drop>())
                    .catch(reject);
            },
        },
        payouts: {
            list: () => fetch(`${API.BASE_URL}admin/payouts`, {
                headers: headers(API.getToken())
            })
                .then(json<Payout[]>())
                .catch(reject)
        },
        servers: {
            list: (offset = 0, limit = 31) => {
                const paging = new URLSearchParams();
                paging.append("_offset", offset.toString());
                paging.append("_limit", limit.toString());
                return fetch(`${API.BASE_URL}admin/servers?${paging}`, {
                    headers: headers(API.getToken())
                })
                    .then(json<Server[]>())
                    .catch(reject);
            }
        },
        users: {
            list: (offset = 0, limit = 31) => {
                const paging = new URLSearchParams();
                paging.append("_offset", offset.toString());
                paging.append("_limit", limit.toString());
                return fetch(`${API.BASE_URL}user/users?${paging}`, {
                    headers: headers(API.getToken())
                })
                    .then(json<ProfileData[]>())
                    .catch(reject);
            },
            get: (id: string) => {
                return fetch(`${API.BASE_URL}user/users/${id}`, {
                    headers: headers(API.getToken())
                })
                    .then(json<ProfileData>())
                    .catch(reject);
            }
        },
        groups: {
            list: (offset = 0, limit = 31) => {
                const paging = new URLSearchParams();
                paging.append("_offset", offset.toString());
                paging.append("_limit", limit.toString());
                return fetch(`${API.BASE_URL}admin/groups?${paging}`, {
                    headers: headers(API.getToken())
                })
                    .then(json<Group[]>())
                    .catch(reject);
            }
        },
        wallets: {
            list: (offset = 0, limit = 31) => {
                const paging = new URLSearchParams();
                paging.append("_offset", offset.toString());
                paging.append("_limit", limit.toString());
                return fetch(`${API.BASE_URL}admin/wallets?${paging}`, {
                    headers: headers(API.getToken())
                })
                    .then(json<Wallet[]>())
                    .catch(reject);
            }
        },
        transcripts: {
            list: (offset = 0, limit = 31) => {
                const paging = new URLSearchParams();
                paging.append("_offset", offset.toString());
                paging.append("_limit", limit.toString());
                return fetch(`${API.BASE_URL}admin/transcripts?${paging}`, {
                    headers: headers(API.getToken())
                })
                    .then(json<Transcript[]>())
                    .catch(reject);
            }
        }
    }),
    payment: ({
        payouts: {
            get: () => fetch(`${API.BASE_URL}payment/payouts`, {
                headers: headers(API.getToken())
            })
                .then(json<Payout[]>())
                .catch(reject),
            id: (id: string) => ({
                get: () => fetch(`${API.BASE_URL}payment/payouts/${id}`, {
                    headers: headers(API.getToken())
                })
                    .then(json<Payout>())
                    .catch(reject)
            })
        },
    }),
    hosting: ({
        versions: (type: ServerTypes) => fetch(`${API.BASE_URL}hosting/versions`, {
            method: "PUT",
            body: JSON.stringify({ type }),
            headers: headers(API.getToken())
        }).then(json<string[]>()).catch(reject),
        servers: (): Promise<Server[]> => fetch(`${API.BASE_URL}hosting/servers`, {
            headers: headers(API.getToken())
        }).then(x => x.json()),
        create: (data: ServerCreate) => fetch(`${API.BASE_URL}hosting/servers`, {
            method: 'POST',
            body: JSON.stringify(data),
            headers: headers(API.getToken())
        })
            .then(none())
            .catch(reject),
        meta: (): Promise<Meta> => fetch(`${API.BASE_URL}hosting/meta`, {
            headers: headers(API.getToken())
        }).then(x => x.json()),
        serverId: (id: string) => ({
            get: () => fetch(`${API.BASE_URL}hosting/servers/${id}`, {
                headers: headers(API.getToken())
            })
                .then(json<Server>())
                .catch(reject),
            edit: (data: { name?: string, memory?: number, disk?: number, cpu?: number; }) => fetch(`${API.BASE_URL}hosting/servers/${id}`, {
                method: 'PATCH',
                body: JSON.stringify(data),
                headers: headers(API.getToken())
            })
                .then(none())
                .catch(reject),
            delete: () => fetch(`${API.BASE_URL}hosting/servers/${id}`, {
                method: 'DELETE',
                headers: headers(API.getToken())
            })
                .then(none())
                .catch(reject),
            audit: () => fetch(`${API.BASE_URL}hosting/servers/${id}/audit`, {
                headers: headers(API.getToken())
            })
                .then(json<ServerAudit[]>())
                .catch(reject),
            forcerestart: () => fetch(`${API.BASE_URL}hosting/servers`, {
                method: 'PUT',
                body: JSON.stringify({ id }),
                headers: headers(API.getToken())
            })
                .then(none())
                .catch(reject),
            start: () => fetch(`${API.BASE_URL}hosting/servers/${id}/start`, {
                headers: headers(API.getToken())
            })
                .then(none())
                .catch(reject),
        }),
        store: ({
            create: (type: StoreItems) => fetch(`${API.BASE_URL}hosting/store`, {
                method: 'POST',
                body: JSON.stringify(type),
                headers: headers(API.getToken())
            })
                .then(none())
                .catch(reject)
        })
    }),
    music: ({
        drops: {
            list: () => fetch(`${API.BASE_URL}music/drops`, {
                headers: headers(API.getToken())
            })
                .then(json<Drop[]>())
                .catch(reject),
            create: () => fetch(`${API.BASE_URL}music/`, {
                method: "POST",
                headers: headers(API.getToken())
            })
                .then(json<{ id: string; }>())
                .catch(reject)
        },
        id: (id: string) => ({
            get: () => fetch(`${API.BASE_URL}music/drops/${id}`, {
                headers: headers(API.getToken())
            })
                .then(json<Drop>())
                .catch(reject),
            update: (data: Partial<Drop>) => fetch(`${API.BASE_URL}music/drops/${id}`, {
                method: "PATCH",
                body: JSON.stringify(data),
                headers: headers(API.getToken())
            })
                .then(none())
                .catch(reject),
            review: {
                post: (data: { title: string, reason: string[], body: string; denyEdits: boolean; }) => fetch(`${API.BASE_URL}music/${id}/review`, {
                    method: "POST",
                    headers: headers(API.getToken()),
                    body: JSON.stringify(data)
                })
                    .then(none())
                    .catch(reject),
            },
            type: {
                post: (type: DropType) => fetch(`${API.BASE_URL}music/${id}/type/${type}`, {
                    method: "POST",
                    headers: headers(API.getToken())
                })
                    .then(none())
                    .catch(reject),
            },
            download: () => fetch(`${API.BASE_URL}music/drops/${id}/download`, {
                headers: headers(API.getToken())
            })
                .then(blob())
                .catch(reject),
            artwork: () => fetch(`${API.BASE_URL}music/${id}/artwork`, {
                headers: headers(API.getToken())
            })
                .then(blob())
                .catch(reject)
        })
    })
};

function headers(token: string) {
    return {
        "Authorization": `JWT ${token}`
    };
}
