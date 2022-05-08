// deno-lint-ignore-file no-unused-vars
import { delay } from "https://deno.land/std@0.138.0/async/mod.ts";
type ArtistType = "PRIMARY";

type Release = {
    id: string,
    type: "PUBLISHED" | "PRIVATE" | "UNDER_REVIEW" | "UNSUBMITTED",
    title?: string,
    upc?: string,
    release?: string,
    picture?: string,
    artists?: [ name: string, img: string, type: ArtistType ][]
};

export const API = {
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
        email: {
            post: async ({ email, password }: { email: string, password: string }) => {
                await delay(1000);
                return { refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwidXNlciI6MTAsIm5hbWUiOiJsdWNzb2Z0IiwibWFpbCI6Im1haWxAbHVjc29mdC5kZSIsInBpY3R1cmUiOiJodHRwczovL2x1Y3NvZnQuZGUvaW1nLzNEX2RhcmtfbHVjc29mdC5wbmciLCJpYXQiOjE1MTYyMzkwMjJ9.blMgwFi72mQZ4lxEAXeVfpK_pK6yJyZFyfAtn58xB-4" };
            }
        }
    },
    bbn: {
        music: {
            list: {
                get: async () => {
                    await delay(1000);
                    return <Release[]>[
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
            [ "{id}" ]: {
                publish: {
                    post: async (id: string) => {
                        await delay(1000);
                        return true;
                    },
                },
                unpublish: {
                    post: async (id: string) => {
                        await delay(1000);
                        return true;
                    },
                },
                put: async (id: string, data: Release) => {
                    await delay(1000);
                    return true;
                },
                post: async (id: string, data: Release) => {
                    await delay(1000);
                    return true;
                },
                get: async (id: string) => {
                    await delay(1000);
                    return {
                        id: "id",
                        type: "PUBLISHED",
                        artists: [
                            [ "joe", "biden", "PRIMARY" ]
                        ],
                    };
                }
            }
        }
    }
};