// deno-lint-ignore-file no-unused-vars
import { delay } from "https://deno.land/std@0.140.0/async/mod.ts";
type ArtistType = "PRIMARY";

type Drop = {
    id: string,
    type: "PUBLISHED" | "PRIVATE" | "UNDER_REVIEW" | "UNSUBMITTED",
    title?: string,
    upc?: string,
    release?: string,
    artwork?: string,
    artists?: [ name: string, img: string, type: ArtistType ][],
    songs?: {
        Id: string;
        "Primary Genre"?: string;
        "Secondary Genre"?: string;
        Artists?: string;
        Country?: string;
        Explicit?: boolean;
        Name?: string;
        Year?: number;
    }[]
};

export const API = {
    user: (token: string) => ({
        setMe: {
            post: async (para: Partial<{ name: string, password: string }>) => {
                const data = await fetch("http://localhost:8443/api/user/set-me", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": token
                    },
                    body: JSON.stringify(para)
                }).then(x => x.json())
                console.log(data);
                return data;
            }
        }
    }),
    auth: {
        refresh: {
            post: async ({ refreshToken }: { refreshToken: string }) => {
                await delay(1000);
                return { accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwidXNlciI6MTAsIm5hbWUiOiJsdWNzb2Z0IiwibWFpbCI6Im1haWxAbHVjc29mdC5kZSIsInBpY3R1cmUiOiJodHRwczovL2x1Y3NvZnQuZGUvaW1nLzNEX2RhcmtfbHVjc29mdC5wbmciLCJpYXQiOjE1MTYyMzkwMjJ9.blMgwFi72mQZ4lxEAXeVfpK_pK6yJyZFyfAtn58xB-4" };
            }
        },
        google: {
            post: async ({ email, password }: { email: string, password: string }) => {
                await delay(1000);
                return { refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwidXNlciI6MTAsIm5hbWUiOiJsdWNzb2Z0IiwibWFpbCI6Im1haWxAbHVjc29mdC5kZSIsInBpY3R1cmUiOiJodHRwczovL2x1Y3NvZnQuZGUvaW1nLzNEX2RhcmtfbHVjc29mdC5wbmciLCJpYXQiOjE1MTYyMzkwMjJ9.blMgwFi72mQZ4lxEAXeVfpK_pK6yJyZFyfAtn58xB-4" };
            }
        },
        fromEmail: {
            get: async (id: string) => {
                const data = await fetch("http://localhost:8443/api/auth/from-email/" + id, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json"
                    }
                }).then(x => x.json())
                console.log(data);
                return data;
            }
        },
        forgotPassword: {
            post: async ({ email, redirect }: { email: string, redirect: string }) => {
                const data = await fetch("http://localhost:8443/api/auth/forgot-password", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        email,
                        redirect
                    })
                }).then(x => x.json())
                console.log(data);
                return data;
            }
        },
        email: {
            post: async ({ email, password }: { email: string, password: string }) => {
                const data = await fetch("http://localhost:8443/api/auth/email", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        email,
                        password
                    })
                }).then(x => x.json())
                console.log(data);
                return data;
            }
        }
    },
    music: {
        list: {
            get: async () => {
                await delay(1000);
                return <Drop[]>[
                    {
                        id: "id",
                        type: "PUBLISHED",
                        artists: [
                            [ "joe", "biden", "PRIMARY" ]
                        ],
                    }
                ];
            }
        },
        post: async () => {
            // creates a new drop
            await delay(1000);
            return "id";
        },
        [ "{id}" ]: (id: string) => ({
            put: async (data: FormData) => {
                await delay(1000);
                return true;
            },
            get: async () => {
                await delay(1000);
                return {
                    id: "id",
                    type: "PUBLISHED",
                    artists: [
                        [ "joe", "biden", "PRIMARY" ]
                    ],
                };
            },
            artwork: {
                get: () => {
                    return new Blob();
                }
            }
        })
    }
};