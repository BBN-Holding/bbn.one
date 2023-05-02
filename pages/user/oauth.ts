import { Button, Vertical, View, WebGen } from "webgen/mod.ts";
import '../../assets/css/main.css';
import '../../assets/css/signin.css';
import { DynaNavigation } from "../../components/nav.ts";
import { API } from "../manager/RESTSpec.ts";
import { Redirect } from "../manager/helper.ts";
import { handleStateChange } from "./actions.ts";

Redirect();

const para = new URLSearchParams(location.search);
const params = {
    state: para.get("state"),
    type: para.get("type"),
    code: para.get("code")
};


WebGen();

View(() => Vertical(
    ...DynaNavigation("Home"),
    Button("Accept and Redirect").onClick(() => {
        const url = new URL("https://p.bbn.one/")
        url.searchParams.set("code", API.getToken());
        url.searchParams.set("state", params.state!);
        window.location.href = url.toString();
    })
))
    .appendOn(document.body);

await handleStateChange();
