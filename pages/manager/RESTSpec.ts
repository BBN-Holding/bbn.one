// deno-lint-ignore-file no-unused-vars
import { assert } from "https://deno.land/std@0.140.0/testing/asserts.ts";
export type ArtistTypes = "PRIMARY" | "FEATURING" | "SONGWRITER" | "PRODUCER";

export type Drop = {
    _id: string;
    user: string;
    type: 'PUBLISHED' | 'PRIVATE' | 'UNDER_REVIEW' | 'UNSUBMITTED';
    title?: string;
    upc?: string;
    artists?: [ name: string, img: string, type: ArtistTypes ][];
    language?: string;
    primaryGenre?: string;
    secondaryGenre?: string;
    release?: string;
    artwork?: string;
    [ "artwork-url" ]?: string;
    compositionCopyright?: string;
    soundRecordingCopyright?: string;
    comments?: string;
    song?: {
        Id: string;
        Title?: string;
        PrimaryGenre?: string;
        SecondaryGenre?: string;
        Artists?: [ name: string, img: string, type: ArtistTypes ][];
        Country?: string;
        File?: string;
        Explicit?: boolean;
        Year?: number;
    }[];
};

export type ErrorObject = {
    error: true,
    type: 'assert' | 'client-side' | string,
    message?: string;

    // Only visable when running in verbose
    stack?: string;
};
export const API = {
    getToken: () => localStorage[ "access-token" ],
    BASE_URL: location.hostname == "bbn.one" ? "https://bbn.one/api/" : "http://localhost:8443/api/@bbn/",
    // deno-lint-ignore no-explicit-any
    isError: (data: any): data is ErrorObject => typeof data === "object" && data.error,
    permission: {
        consts: {
            admin: "6293b146d55350d24e6da542",
            reviewer: "6293bb4fd55350d24e6da550",
        },
        canReview: (x: string[]) => x.find(x => API.permission.consts.admin == x || API.permission.consts.reviewer == x)
    },
    user: (token: string) => ({
        mail: {
            validate: {
                post: (token: string) => {
                    return fetch(`${API.BASE_URL}user/mail/validate/` + encodeURIComponent(token), {
                        method: "POST",
                        headers: headers(token),
                    }).then(x => x.json());
                }
            },
            resendVerifyEmail: {
                post: () => {
                    return fetch(`${API.BASE_URL}user/mail/resend-verify-email`, {
                        method: "POST",
                        headers: headers(token),
                    }).then(x => x.json());
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
        }
    }),
    auth: {
        fromUserInteractionLink: () => `${API.BASE_URL}auth/google-redirect?redirect=${location.href}&type=google-auth`,
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
                } catch (error) {
                    return <ErrorObject>{ error: true, type: "client-side" };
                }
            }
        }
    },
    music: (token: string) => ({
        reviews: {
            get: async () => {
                const data = await fetch(`${API.BASE_URL}music/reviews`, {
                    headers: headers(token)
                }).then(x => x.json());
                return data.drops as Drop[];
            },
        },
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
            put: async (data: FormData) => {
                const fetchData = await fetch(`${API.BASE_URL}music/${id}`, {
                    method: "PUT",
                    body: data,
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
