import { Button, ButtonComponent, ButtonStyle, Color, Custom, Dialog, Horizontal, img, Input, Page, PlainText, Spacer, Vertical, View, WebGen } from "../../deps.ts";
import '../../assets/css/main.css';
import '../../assets/css/signin.css';
import '../../assets/css/components/subsidiaries.css';
import heroImage from '../../assets/img/hero-img.png';
import { DynaNavigation } from "../../components/nav.ts";
import { Center, syncFromData } from "./helper.ts";
import { API } from "./RESTSpec.ts";

WebGen({
})


if (localStorage[ "access-token" ])
    location.href = "/music"; // TODO do this better

const para = new URLSearchParams(location.search)
if (para.has("id")) {
    const dialog = Dialog<{ token: string, firstTime: boolean }>(({ update, state, use }) => {
        if (!state.firstTime) {
            API.auth.fromEmail.get(para.get("id")!).then(x => {
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

View(() => Vertical(
    DynaNavigation("Home"),
    Horizontal(
        Vertical(
            PlainText("Welcome back!")
                .setMargin("5rem 0 1.5rem")
                .addClass("line-header")
                .setWidth("21rem")
                .setFont(5.375, 800),
            Button("Sign in with Google").setMargin("0 0 1.8rem"),
            Page((formData) => [
                Input({ placeholder: "Email", type: "email", ...syncFromData(formData, "email") }),
                Input({ placeholder: "Password", type: "password", ...syncFromData(formData, "password") }),
                Button("Login")
                    .onPromiseClick(async () => {
                        const data = await API.auth.email.post({
                            email: formData.get("email")?.toString() ?? "",
                            password: formData.get("password")?.toString() ?? ""
                        })

                        if (data.JWT) {
                            localStorage[ "access-token" ] = data.JWT;
                            location.href = "/music";
                        }
                    })
                    .setJustify("center"),
                Horizontal(
                    PlainText("New here?"),
                    Button("Create a Account")
                        .setStyle(ButtonStyle.Inline)
                        .setColor(Color.Colored)
                        .addClass("link"),
                    Spacer()
                )
                    .setMargin("2rem 0 0"),
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