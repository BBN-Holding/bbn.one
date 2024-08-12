import { API, Navigation } from "shared/mod.ts";
import { asState, Body, Box, Button, CenterV, Empty, getErrorMessage, Grid, Horizontal, isMobile, Label, Spacer, TextInput, Validate, Vertical, WebGen } from "webgen/mod.ts";
import { zod } from "webgen/zod.ts";
import "../../assets/css/main.css";
import { DynaNavigation } from "../../components/nav.ts";
import { logOut, RegisterAuthRefresh } from "../shared/helper.ts";
import { ChangePersonal } from "./settings.personal.ts";

WebGen();

await RegisterAuthRefresh();

const state = asState({
    newPassword: <string | undefined> undefined,
    verifyNewPassword: <string | undefined> undefined,
    validationState: <zod.ZodError | undefined> undefined,
});

const settingsMenu = Navigation({
    title: "Settings",
    children: [
        {
            id: "personal",
            title: "Personal",
            subtitle: "Username, Email, Profile Picture...",
            children: [
                ChangePersonal(),
            ],
        },
        {
            id: "change-password",
            title: "Change Password",
            children: [
                Vertical(
                    Grid([
                        { width: 2 },
                        Vertical(
                            TextInput("password", "New Password").ref(state.$newPassword),
                            TextInput("password", "Verify New Password").ref(state.$verifyNewPassword),
                        ).setGap("20px"),
                    ])
                        .setDynamicColumns(1, "12rem")
                        .setJustifyContent("center")
                        .setGap("15px"),
                    Horizontal(
                        Spacer(),
                        Box(
                            state.$validationState.map((error) =>
                                error
                                    ? CenterV(
                                        Label(getErrorMessage(error))
                                            .addClass("error-message")
                                            .setMargin("0 0.5rem 0 0"),
                                    )
                                    : Empty()
                            ).asRefComponent(),
                        ),
                        Button("Save").onClick(async () => {
                            const { error, validate } = Validate(
                                state,
                                zod.object({
                                    newPassword: zod.string({ invalid_type_error: "New password is missing" }).min(8),
                                    verifyNewPassword: zod.string({ invalid_type_error: "Verify New password is missing" }).min(8).refine((val) => val == state.newPassword, "Your new password didn't match"),
                                }),
                            );

                            const data = validate();
                            if (error.getValue()) return state.validationState = error.getValue();
                            if (data) await API.user.setMe.post({ password: data.newPassword });
                            logOut();
                            state.validationState = undefined;
                        }),
                    ),
                ).setGap("20px"),
            ],
        },
        // {
        //     id: "passkeys",
        //     title: "Passkeys",
        //     children: [
        //         Vertical(
        //             Button("Create Passkey").onClick(async () => {
        //                 const publicKey = {
        //                     challenge: new Uint8Array([ 117, 61, 252, 231, 191, 241 ]),
        //                     rp: { id: "localhost", name: "BBN Holding" },
        //                     user: {
        //                         id: new TextEncoder().encode(activeUser.id ?? ""),
        //                         name: activeUser.email ?? "",
        //                         displayName: activeUser.username ?? ""
        //                     },
        //                     excludeCredentials: [
        //                         { id: new Uint8Array([ 79, 252, 83, 72, 214, 7, 89, 26 ]), type: "public-key" as PublicKeyCredentialType, transports: [ "usb", "nfc", "ble" ] as AuthenticatorTransport[] }
        //                     ],
        //                     pubKeyCredParams: [ { type: "public-key" as PublicKeyCredentialType, alg: -7 }, { type: "public-key" as PublicKeyCredentialType, alg: -257 } ]
        //                 };

        //                 const credential = await navigator.credentials.create({ publicKey }) as PublicKeyCredential;

        //                 console.log(credential);

        //                 const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';

        //                 // Use a lookup table to find the index.
        //                 const lookup = new Uint8Array(256);
        //                 for (let i = 0; i < chars.length; i++) {
        //                     lookup[ chars.charCodeAt(i) ] = i;
        //                 }

        //                 const encode = (arraybuffer: ArrayBuffer): string => {
        //                     const bytes = new Uint8Array(arraybuffer);
        //                     const len = bytes.length;
        //                     let base64 = '';

        //                     for (let i = 0; i < len; i += 3) {
        //                         base64 += chars[ bytes[ i ] >> 2 ];
        //                         base64 += chars[ ((bytes[ i ] & 3) << 4) | (bytes[ i + 1 ] >> 4) ];
        //                         base64 += chars[ ((bytes[ i + 1 ] & 15) << 2) | (bytes[ i + 2 ] >> 6) ];
        //                         base64 += chars[ bytes[ i + 2 ] & 63 ];
        //                     }

        //                     if (len % 3 === 2) {
        //                         base64 = base64.substring(0, base64.length - 1);
        //                     } else if (len % 3 === 1) {
        //                         base64 = base64.substring(0, base64.length - 2);
        //                     }

        //                     return base64;
        //                 };

        //                 console.log(encode(credential.response.clientDataJSON));
        //                 console.log(encode((credential.response as AuthenticatorAttestationResponse).attestationObject));
        //                 console.log(credential.getClientExtensionResults());
        //             })
        //         ).setGap("20px"),
        //     ]
        // },
        {
            id: "logout",
            title: "Logout",
            clickHandler: () => logOut(),
        },
    ],
}).addClass(
    isMobile.map((mobile) => mobile ? "mobile-navigation" : "navigation"),
    "limited-width",
);
Body(Vertical(
    DynaNavigation("Settings"),
    settingsMenu,
));
