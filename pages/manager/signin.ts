import { Button, ButtonStyle, Color, Custom, Horizontal, img, Input, PlainText, Spacer, Vertical, View, WebGen } from "../../deps.ts";
import '../../assets/css/main.css';
import '../../assets/css/signin.css';
import '../../assets/css/components/subsidiaries.css';
import heroImage from '../../assets/img/hero-img.png';
import { renderNav } from "../../components/nav.ts";

WebGen({
})

View(() => Vertical(
    renderNav(),
    Horizontal(
        Vertical(
            PlainText("Welcome back!")
                .setMargin("5rem 0 1.5rem")
                .addClass("line-header")
                .setWidth("21rem")
                .setFont(5.375, 800),
            Button("Sign in with Google").setMargin("0 0 1.8rem"),
            Input({ placeholder: "Email", type: "email" }),
            Input({ placeholder: "Password", type: "password" }),
            Button("Login")
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
                    .addClass("link"),
                Spacer()
            )
        ).setGap("11px"),
        Spacer()
    ).addClass("subsidiary-list"),
    Custom(img(heroImage)).addClass("background-image")
))
    .appendOn(document.body)