import { ZodError } from "https://deno.land/x/zod@v3.22.4/ZodError.ts";
import zod from "https://deno.land/x/zod@v3.22.4/index.ts";
import { API, Navigation } from "shared/mod.ts";
import { Body, Box, Button, CenterV, Empty, Grid, Horizontal, Label, Spacer, TextInput, Validate, Vertical, WebGen, asState, getErrorMessage, isMobile } from "webgen/mod.ts";
import '../../assets/css/main.css';
import { DynaNavigation } from "../../components/nav.ts";
import { RegisterAuthRefresh, logOut } from "../_legacy/helper.ts";
import { ChangePersonal } from "./settings.personal.ts";

WebGen();

await RegisterAuthRefresh();

const state = asState({
    newPassword: <string | undefined>undefined,
    verifyNewPassword: <string | undefined>undefined,
    validationState: <ZodError | undefined>undefined,
});

const settingsMenu = Navigation({
    title: "Settings",
    children: [
        {
            id: "personal",
            title: "Personal",
            subtitle: "Username, Email, Profile Picture...",
            children: [
                ChangePersonal()
            ]
        },
        {
            id: "change-password",
            title: "Change Password",
            children: [
                Vertical(
                    Grid([
                        { width: 2 },
                        Vertical(
                            TextInput("password", "New Password").sync(state, "newPassword"),
                            TextInput("password", "Verify New Password").sync(state, "verifyNewPassword")
                        ).setGap("20px")
                    ])
                        .setDynamicColumns(1, "12rem")
                        .addClass("settings-form")
                        .setGap("15px"),
                    Horizontal(
                        Spacer(),
                        Box(state.$validationState.map(error => error ? CenterV(
                            Label(getErrorMessage(error))
                                .addClass("error-message")
                                .setMargin("0 0.5rem 0 0")
                        )
                            : Empty()).asRefComponent()),
                        Button("Save").onClick(async () => {
                            const { error, validate } = Validate(
                                state,
                                zod.object({
                                    newPassword: zod.string({ invalid_type_error: "New password is missing" }).min(4),
                                    verifyNewPassword: zod.string({ invalid_type_error: "Verify New password is missing" }).min(4).refine(val => val == state.newPassword, "Your new password didn't match")
                                })
                            );

                            const data = validate();
                            if (error.getValue()) return state.validationState = error.getValue();
                            if (data) await API.user.setMe.post({ password: data.newPassword });
                            logOut();
                            state.validationState = undefined;
                        })),
                ).setGap("20px"),
            ]
        },
        {
            id: "logout",
            title: "Logout",
            clickHandler: () => logOut()
        }
    ]
}).addClass(
    isMobile.map(mobile => mobile ? "mobile-navigation" : "navigation"),
    "limited-width"
);
Body(Vertical(
    DynaNavigation("Settings"),
    settingsMenu
));
