// deno-lint-ignore-file no-unused-vars
import { delay } from "https://deno.land/std@0.140.0/async/mod.ts";
import { assert } from "https://deno.land/std@0.140.0/testing/asserts.ts";
export type ArtistTypes = "PRIMARY" | "FEATURING" | "SONGWRITER" | "PRODUCER";

export type Drop = {
    id: string;
    user?: string;
    type: 'PUBLISHED' | 'PRIVATE' | 'UNDER_REVIEW' | 'UNSUBMITTED';
    title?: string;
    upc?: string;
    artists?: [ name: string, img: string, type: ArtistTypes ][];
    language?: string;
    primaryGenre?: string;
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
        Artists?: string;
        Country?: string;
        File?: string;
        Explicit?: boolean;
        Year?: number;
    }[];
};
export const API = {
    getToken: () => localStorage[ "access-token" ],
    BASE_URL: location.hostname == "bbn.one" ? "https://bbn.one/api/" : "http://localhost:8443/api/",
    user: (token: string) => ({
        setMe: {
            post: async (para: Partial<{ name: string, password: string; }>) => {
                const data = await fetch(`${API.BASE_URL}user/set-me`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": token
                    },
                    body: JSON.stringify(para)
                }).then(x => x.json());
                console.log(data);
                return data;
            }
        }
    }),
    auth: {
        refreshAccessToken: {
            post: async ({ refreshToken }: { refreshToken: string; }) => {
                return await fetch(`${API.BASE_URL}auth/refresh-access-token`, {
                    method: "POST",
                    headers: {
                        "Authorization": refreshToken
                    }
                }).then(x => x.json()) as { accessToken: string; };
            }
        },
        google: {
            post: async ({ code, state }: { code: string, state: string; }) => {
                const param = new URLSearchParams({ code, state });
                return await fetch(`${API.BASE_URL}auth/google?${param.toString()}`, {
                    method: "POST"
                }).then(x => x.json()) as { refreshToken: string; };
            }
        },
        fromEmail: {
            get: async (id: string) => {
                const data = await fetch(`${API.BASE_URL}auth/from-email/${id}`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json"
                    }
                }).then(x => x.json());
                console.log(data);
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
            post: async ({ email, password, name }: { email: string, password: string, name: string; }): Promise<{ refreshToken: string; } | null> => {
                try {
                    const data = await fetch(`${API.BASE_URL}auth/register`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            email,
                            password,
                            name
                        })
                    }).then(x => x.json());
                    return data;
                } catch (error) {
                    return null;
                }
            }
        },
        email: {
            post: async ({ email, password }: { email: string, password: string; }): Promise<{ refreshToken: string; } | null> => {
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
                    console.log(data);
                    return data;
                } catch (error) {
                    return null;
                }
            }
        }
    },
    music: (token: string) => ({
        reviews: {
            get: async () => {
                const data = await fetch(`${API.BASE_URL}music/reviews`, {
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": token
                    }
                }).then(x => x.json());
                return data.drops as Drop[];
            },
        },
        list: {
            get: async () => {
                const data = await fetch(`${API.BASE_URL}music/list`, {
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": token
                    }
                }).then(x => x.json());
                return data.drops as Drop[];
            }
        },
        post: async () => {
            const data = await fetch(`${API.BASE_URL}music/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": token
                }
            }).then(x => x.json());
            assert(typeof data.id == "string");
            return data.id as string;
        },
        id: (id: string) => ({
            put: async (data: FormData) => {
                const fetchData = await fetch(`${API.BASE_URL}music/${id}`, {
                    method: "PUT",
                    body: data,
                    headers: {
                        "Authorization": token
                    }
                });
                await fetchData.text();
                assert(fetchData.ok);
            },
            songSownload: async (): Promise<{ code: string; }> => {
                return await fetch(`${API.BASE_URL}music/${id}/song-download`, {
                    method: "POST",
                    headers: {
                        "Authorization": token
                    }
                }).then(x => x.json());
            },
            artwork: async () => {
                return await fetch(`${API.BASE_URL}music/${id}/artwork`, {
                    method: "GET",
                    headers: {
                        "Authorization": token
                    }
                }).then(x => x.blob());
            },
            get: async () => {
                return (await fetch(`${API.BASE_URL}music/${id}`, {
                    method: "GET",
                    headers: {
                        "Authorization": token
                    }
                }).then(x => x.json())).drop;
            },
        })
    })
};
