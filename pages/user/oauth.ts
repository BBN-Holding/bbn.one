import { Button, Vertical, View, WebGen } from "webgen/mod.ts";
import '../../assets/css/main.css';
import '../../assets/css/signin.css';
import { DynaNavigation } from "../../components/nav.ts";
import { API } from "../manager/RESTSpec.ts";
import { Redirect } from "../manager/helper.ts";
import { handleStateChange } from "./actions.ts";

Redirect();

WebGen();

View(() => Vertical(
    ...DynaNavigation("Home"),
    Button("Accept and Redirect").onClick(() => {
        const url = new URL("https://p.bbn.one/redirect")
        url.searchParams.set("code", API.getToken());
        window.location.href = url.toString();
    })
))
    .appendOn(document.body);

await handleStateChange();
