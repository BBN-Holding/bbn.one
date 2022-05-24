import { Button, ButtonStyle, Color, Center, Custom, Dialog, Horizontal, img, Input, Page, PlainText, Spacer, Vertical, View, WebGen, ButtonComponent } from "../../deps.ts";
import '../../assets/css/main.css';
import '../../assets/css/signin.css';
import '../../assets/css/components/subsidiaries.css';
import heroImage from '../../assets/img/hero-img.png';
import googleLog from '../../assets/img/googleLogo.svg';
import { DynaNavigation } from "../../components/nav.ts";
import { Redirect, syncFromData } from "./helper.ts";
import { API } from "./RESTSpec.ts";
WebGen({
})
Redirect();

const para = new URLSearchParams(location.search)
const { id, type } = { id: para.get("id"), type: para.get("type") };
if (type == "forgot-password" && id) {
    const dialog = Dialog<{ token: string, firstTime: boolean }>(({ update, state, use }) => {
        if (!state.firstTime) {
            API.auth.fromEmail.get(id).then(x => {
                if (x.message)
                    use(PlainText("Error: " + x.message).addClass("error-message"))
                update({ token: x.JWT })
            })
            update({ firstTime: true })
        }
        return Vertical(
            state.token ?
                Page((formData) => [
                    Input({
                        placeholder: "New Password",
                        ...syncFromData(formData, "password")
                    }),
                    Button("Update Password")
                        .onPromiseClick(async () => {
                            await API.user(state.token!).setMe.post({
                                password: formData.get("password")?.toString()
                            });
                            dialog.remove()
                        })
                ]).getComponents()
                : Center(PlainText("Loading..."))
        );
    })
        .setTitle("Reset your Password")
        .open()
}

View<{ error?: string, signup?: boolean }>(({ state, update }) => Vertical(
    DynaNavigation("Home"),
    Horizontal(
        Vertical(
            PlainText("Welcome back!")
                .setMargin("5rem 0 .8rem")
                .addClass("line-header")
                .setWidth("21rem")
                .setFont(5.375, 800),
            Button("Sign in with Google")
                .setMargin("0 0 .8rem")
                .setJustify("center")
                .addPrefix(Custom(img(googleLog)).addClass("prefix-logo")),
            Page((formData) => [
                ...state.signup ? [ Input({ placeholder: "Name", type: "text", ...syncFromData(formData, "name") }) ] : [],
                Input({ placeholder: "Email", type: "email", ...syncFromData(formData, "email") }),
                Input({ placeholder: "Password", type: "password", ...syncFromData(formData, "password") }),
                Button(state.signup ? "Register" : "Login")
                    .onPromiseClick(handleSignUpInButton(formData, state, update))
                    .setJustify("center"),
                Horizontal(state.error ? PlainText(`Error: ${state.error}`).addClass("error-message") : null, Spacer()),
                Horizontal(
                    PlainText(state.signup ? "Known here?" : "New here?"),
                    Button(state.signup ? "Sign in" : "Create a Account")
                        .setStyle(ButtonStyle.Inline)
                        .onClick(() => update({ signup: !state.signup }))
                        .setColor(Color.Colored)
                        .addClass("link"),
                    Spacer()
                )
                    .setMargin("1rem 0 0"),
                Horizontal(
                    PlainText("Forgot your Password?"),
                    Button("Reset it here")
                        .setStyle(ButtonStyle.Inline)
                        .setColor(Color.Colored)
                        .onPromiseClick(async () => {
                            await API.auth.forgotPassword.post({
                                email: formData.get("email")?.toString() ?? "",
                                redirect: location.href
                            });
                        })
                        .addClass("link"),
                    Spacer()
                )
            ]).disableAutoSpacerAtBottom().getComponents(),
        ).setGap("11px"),
        Spacer()
    ).addClass("subsidiary-list"),
    Custom(img(heroImage)).addClass("background-image")
))
    .appendOn(document.body)

function handleSignUpInButton(formData: FormData, state: Partial<{ error?: string | undefined; signup?: boolean | undefined; }>, update: (data: Partial<{ error?: string | undefined; signup?: boolean | undefined; }>) => void): (env: MouseEvent, e: ButtonComponent) => Promise<void> {
    return async () => {
        const { name, email, password } = {
            email: formData.get("email")?.toString() ?? "",
            password: formData.get("password")?.toString() ?? "",
            name: formData.get("name")?.toString() ?? ""
        };
        let data: { JWT: string } | null = null;
        if (state.signup)
            data = await API.auth.register.post({
                name,
                email,
                password
            });
        else
            data = await API.auth.email.post({
                email,
                password
            });

        if (!data)
            if (state.signup)
                update({ error: "Email is not unique" });
            else
                update({ error: "Wrong Email or Password" });
        else {
            localStorage[ "access-token" ] = data.JWT;
            Redirect();
        }
    };
}
