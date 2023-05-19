import { assert } from "std/testing/asserts.ts";
import { Drop, DropType, OAuthApp, Payout, File, Server, PteroServer, PowerState, ServerCreate, Meta } from "../../spec/music.ts";
import { ProfileData } from "./helper.ts";

export type ErrorObject = {
    error: true,
    type: 'assert' | 'client-side' | string,
    message?: string;

    // Only visable when running in verbose
    stack?: string;
};
export const Permissions = [
    "/hmsys",
    "/hmsys/user",
    "/hmsys/user/manage",

    "/bbn",
    "/bbn/beta-hosting",
    "/bbn/manage",
    "/bbn/manage/drops",
    "/bbn/manage/drops/review",
    "/bbn/manage/payouts",
] as const;

export type Permission = typeof Permissions[ number ];

export const API = {
    getToken: () => localStorage[ "access-token" ],
    BASE_URL: localStorage.OVERRIDE_BASE_URL || (location.hostname == "bbn.one" ? "https://bbn.one/api/@bbn/" : "http://localhost:8443/api/@bbn/"),
    // deno-lint-ignore no-explicit-any
    isError: (data: any): data is ErrorObject => typeof data === "object" && data.error,
    permission: Permissions,
    _legacyPermissionFromGroups: (group: string) => {
        const admin = "6293b146d55350d24e6da542";
        const reviewer = "6293bb4fd55350d24e6da550";
        if (group === reviewer)
            return [
                "/bbn/payouts"
            ];

        if (group === admin)
            // Always highest permissions
            return [
                "/bbn",
                "/hmsys"
            ];
        return [];
    },
    isPermited: (requiredPermissions: Permission[], userPermission: Permission[]) => {
        return requiredPermissions.every(required => userPermission.find(user => required.startsWith(user)));
    },
    user: (token: string) => ({
        mail: {
            validate: {
                post: (emailToken: string) => fetch(`${API.BASE_URL}user/mail/validate/` + encodeURIComponent("JWT " + emailToken), {
                    method: "POST",
                    headers: headers(token),
                }).then(x => x.text())

            },
            resendVerifyEmail: {
                post: () => {
                    return fetch(`${API.BASE_URL}user/mail/resend-verify-email`, {
                        method: "POST",
                        headers: headers(token),
                    }).then(x => x.text());
                }
            }
        },
        setMe: {
            post: async (para: Partial<{ name: string, password: string; }>) => {
                const data = await fetch(`${API.BASE_URL}user/set-me`, {
                    method: "POST",
                    headers: headers(token),
                    body: JSON.stringify(para)
                }).then(x => x.text());
                return data;
            }
        },
        list: {
            get: async () => {
                const data = await fetch(`${API.BASE_URL}user/users`, {
                    headers: headers(token)
                }).then(x => x.json());
                return data.users as ProfileData[];
            }
        },
        zendesk: {
            post: async () => {
                return await fetch(`${API.BASE_URL}user/zendesk`, {
                    method: "POST",
                    headers: headers(token)
                }).then(x => x.json()) as { jwt: string; };
            }
        },
    }),
    auth: {
        fromUserInteractionLinkGoogle: () => `${API.BASE_URL}auth/google-redirect?redirect=${localStorage.getItem('goal') ?? '/music'}&type=google-auth`,
        fromUserInteractionLinkDiscord: () => `${API.BASE_URL}auth/discord-redirect?redirect=${localStorage.getItem('goal') ?? '/music'}&type=discord-auth`,
        refreshAccessToken: {
            post: async ({ refreshToken }: { refreshToken: string; }) => {
                return await fetch(`${API.BASE_URL}auth/refresh-access-token`, {
                    method: "POST",
                    headers: {
                        "Authorization": "JWT " + refreshToken
                    }
                }).then(x => x.json()) as { token: string; };
            }
        },
        google: {
            post: async ({ code, state }: { code: string, state: string; }) => {
                const param = new URLSearchParams({ code, state });
                return await fetch(`${API.BASE_URL}auth/google?${param.toString()}`, {
                    method: "POST"
                }).then(x => x.json()) as { token: string; };
            }
        },
        discord: {
            post: async ({ code, state }: { code: string, state: string; }) => {
                const param = new URLSearchParams({ code, state });
                return await fetch(`${API.BASE_URL}auth/discord?${param.toString()}`, {
                    method: "POST"
                }).then(x => x.json()) as { token: string; };
            }
        },
        fromUserInteraction: {
            get: async (id: string) => {
                const data = await fetch(`${API.BASE_URL}auth/from-user-interaction/${id}`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json"
                    }
                }).then(x => x.json());
                return data;
            }
        },
        forgotPassword: {
            post: ({ email }: { email: string; }) => fetch(`${API.BASE_URL}auth/forgot-password`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email
                })
            }).then(x => x.text())
        },
        register: {
            post: async ({ email, password, name }: { email: string, password: string, name: string; }): Promise<{ token: string; } | ErrorObject> => {
                return await fetch(`${API.BASE_URL}auth/register`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        email,
                        password,
                        name
                    })
                })
                    .then(x => x.json())
                    .catch(() => <ErrorObject>{ error: true, type: "client-side" });
            }
        },
        email: {
            post: async ({ email, password }: { email: string, password: string; }): Promise<{ token: string; } | ErrorObject> => {
                try {

                    const data = await fetch(`${API.BASE_URL}auth/email`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            email,
                            password
                        })
                    }).then(x => x.json());
                    return data;
                } catch (_error) {
                    return <ErrorObject>{ error: true, type: "client-side" };
                }
            }
        }
    },
    oauth: (token: string) => ({
        get: async (clientid: string): Promise<OAuthApp> => {
            const data = await fetch(`${API.BASE_URL}oauth/applications/${clientid}`, {
                headers: headers(token)
            }).then(x => x.json());
            return data;
        },
        list: async (): Promise<OAuthApp[]> => {
            const data = await fetch(`${API.BASE_URL}oauth/applications`, {
                headers: headers(token)
            }).then(x => x.json());
            return data;
        },
        post: async (name: string, redirect: string, icon: string): Promise<{ id: string, secret: string; }> => {
            const data = await fetch(`${API.BASE_URL}oauth/applications`, {
                method: "POST",
                headers: headers(token),
                body: JSON.stringify({ name, redirect, icon })
            }).then(x => x.json());
            return data;
        },
        icon: async (clientid: string) => {
            const data = await fetch(`${API.BASE_URL}oauth/${clientid}/download`, {
                headers: headers(token)
            }).then(x => x.blob());
            return data;
        },
        delete: async (clientid: string) => {
            const data = await fetch(`${API.BASE_URL}oauth/applications/${clientid}`, {
                method: "DELETE",
                headers: headers(token)
            }).then(x => x.json());
            return data;
        }
    }),
    admin: (token: string) => ({
        files: {
            list: async (): Promise<File[]> => {
                const data = await fetch(`${API.BASE_URL}admin/files`, {
                    headers: headers(token)
                }).then(x => x.json());
                return data;
            },
            download: async (id: string) => {
                const data = await fetch(`${API.BASE_URL}admin/files/${id}/download`, {
                    headers: headers(token)
                }).then(x => x.blob());
                return data;
            },
            delete: async (id: string) => {
                const data = await fetch(`${API.BASE_URL}admin/files/${id}`, {
                    method: "DELETE",
                    headers: headers(token)
                }).then(x => x.json());
                return data;
            }
        },
        reviews: {
            get: async () => {
                const data = await fetch(`${API.BASE_URL}admin/reviews`, {
                    headers: headers(token)
                }).then(x => x.json());
                return data as Drop[];
            },
        },
        payouts: {
            get: async () => {
                const data = await fetch(`${API.BASE_URL}admin/payouts`, {
                    headers: headers(token)
                }).then(x => x.json());
                return data as Payout[];
            },
            id: (id: string) => ({
                get: async () => {
                    const data = await fetch(`${API.BASE_URL}admin/payouts/${id}`, {
                        headers: headers(token)
                    }).then(x => x.json());
                    return data as Payout;
                }
            })
        },
        servers: {
            get: async () => {
                const data = await fetch(`${API.BASE_URL}admin/servers`, {
                    headers: headers(token)
                }).then(x => x.json());
                return data as Server[];
            }
        }
    }),
    payment: (token: string) => ({
        payouts: {
            get: async () => {
                const data = await fetch(`${API.BASE_URL}payment/payouts`, {
                    headers: headers(token)
                }).then(x => x.json());
                return data.payouts as Payout[];
            },
            id: (id: string) => ({
                get: async () => {
                    const data = await fetch(`${API.BASE_URL}payment/payouts/${id}`, {
                        headers: headers(token)
                    }).then(x => x.json());
                    return data as Payout;
                }
            })
        },
    }),
    hosting: (token: string) => ({
        servers: (): Promise<Server[]> => {
            return fetch(`${API.BASE_URL}hosting/servers`, {
                headers: headers(token)
            }).then(x => x.json());
        },
        create: (data: ServerCreate) => {
            return fetch(`${API.BASE_URL}hosting/servers`, {
                method: 'POST',
                body: JSON.stringify(data),
                headers: headers(token)
            }).then(x => x.json());
        },
        meta: (): Promise<Meta> => {
            return fetch(`${API.BASE_URL}hosting/meta`, {
                headers: headers(token)
            }).then(x => x.json());
        },
        serverId: (id: string) => ({
            get: (): Promise<PteroServer> => {
                return fetch(`${API.BASE_URL}hosting/servers/${id}`, {
                    headers: headers(token)
                }).then(x => x.json());
            },
            power: (data: PowerState) => {
                return fetch(`${API.BASE_URL}hosting/${id}/power`, {
                    method: 'POST',
                    body: JSON.stringify({
                        signal: data
                    }),
                    headers: headers(token)
                }).then(x => x.json());
            },
            delete: () => {
                return fetch(`${API.BASE_URL}hosting/servers/${id}`, {
                    method: 'DELETE',
                    headers: headers(token)
                }).then(x => x.text());
            }
        }),
    }),
    music: (token: string) => ({
        list: {
            get: async () => {
                const data = await fetch(`${API.BASE_URL}music/list`, {
                    headers: headers(token)
                }).then(x => x.json());
                return data.drops as Drop[];
            }
        },
        post: async () => {
            const data = await fetch(`${API.BASE_URL}music/`, {
                method: "POST",
                headers: headers(token)
            }).then(x => x.json());
            assert(typeof data.id == "string");
            return data.id as string;
        },
        id: (id: string) => ({
            review: {
                post: (data: { title: string, reason: string[], body: string; denyEdits?: boolean; }) => {
                    return fetch(`${API.BASE_URL}music/${id}/review`, {
                        method: "POST",
                        headers: headers(token),
                        body: data ? JSON.stringify(data) : null
                    }).then(x => x.text());
                },
            },
            type: {
                post: (type: DropType, data?: { title: string, reason: string[], body: string; }) => {
                    return fetch(`${API.BASE_URL}music/${id}/type/${type}`, {
                        method: "POST",
                        headers: headers(token),
                        body: data ? JSON.stringify(data) : null
                    }).then(x => x.text());
                },
            },
            post: async (data: Drop) => {
                const fetchData = await fetch(`${API.BASE_URL}music/${id}`, {
                    method: "POST",
                    body: JSON.stringify(data),
                    headers: headers(token)
                });
                await fetchData.text();
                assert(fetchData.ok);
            },
            songSownload: async (): Promise<{ code: string; }> => {
                return await fetch(`${API.BASE_URL}music/${id}/song-download`, {
                    method: "POST",
                    headers: headers(token)
                }).then(x => x.json());
            },
            artwork: async () => {
                return await fetch(`${API.BASE_URL}music/${id}/artwork`, {
                    method: "GET",
                    headers: headers(token)
                }).then(x => x.blob());
            },
            artworkPreview: async () => {
                return await fetch(`${API.BASE_URL}music/${id}/artwork-preview`, {
                    method: "GET",
                    headers: headers(token)
                }).then(x => x.blob());
            },
            artworkStore3k: async () => {
                return await fetch(`${API.BASE_URL}music/${id}/artwork-store3k`, {
                    method: "GET",
                    headers: headers(token)
                }).then(x => x.blob());
            },
            get: async () => {
                return (await fetch(`${API.BASE_URL}music/${id}`, {
                    method: "GET",
                    headers: headers(token)
                }).then(x => x.json()));
            },
        })
    })
};

function headers(token: string): HeadersInit | undefined {
    return {
        "Authorization": "JWT " + token
    };
}
