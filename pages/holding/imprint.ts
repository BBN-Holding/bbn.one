import { Box, Button, ButtonStyle, Horizontal, Label, Spacer, View, WebGen } from "webgen/mod.ts";
import { DynaNavigation } from "../../components/nav.ts";
import { RegisterAuthRefresh } from "../manager/helper.ts";
import { Footer } from "../shared/footer.ts";
import './flowText.css';
WebGen();
await RegisterAuthRefresh();

View(() => Box(
    ...DynaNavigation("Home"),
    Box(
        Label("Imprint", "h2"),
        Label(`BBN Holding Inc.`).setFont(1, 600).addClass("block"),
        Label(`270 Trace Colony Park Dr, Suite B`).addClass("block"),
        Box(Label(`Ridgeland - MS 39157`)),
        Box(Label(`E-Mail: support@bbn.one`)),
        Horizontal(
            Label("See also:"),
            Button("Privacy Policy").setStyle(ButtonStyle.Inline).asLinkButton("/p/privacy-policy"),
            Button("Terms of Use").setStyle(ButtonStyle.Inline).asLinkButton("/p/terms-of-use"),
            Spacer()
        ).addClass("block").setAlign("center"),
        Label(`Contents`, "h3"),
        Label(`BBN Holding regularly examines and updates the contents of this website. However we give no guarantee for the accuracy, completeness, timeliness or reliability of the information provided and are not liable for claims resulting directly or indirectly from flawed or erroneous informat`).addClass("block"),
        Label(`In order to offer our customers additional information we occasionally provide links to other websites. We herewith state explicitly that we have no influence on the set-up, the timeliness or the contents of linked pages. For this reason we distance ourselves expressly from all contents on the pages linked with this Homepage and disclaim all forms of liability for these as well. We are not aware of any content which is illegal, objectionable or contrary to the rules of fair competition. Please inform BBN Holding if you believe that a linked page infringes upon these princip`).addClass("block"),
        Label(`Netiquette and Site Guidelines`, "h3"),
        Label(`For many years, BBN Holding strives to provide helpful and relevant information on the BBN Holding company website. BBN Holding also shares news and information about latest events on maritime\xA0websites or social platforms like LinkedIn. We are happy to connect with you and read your feedb`).addClass("block"),
        Label(`Please keep in mind: comments should be relevant and on-topic. Inappropriate or offensive comments, and in particular those that contain false\xA0/ misleading information or that engage in personal attacks (and similar), may be dele`).addClass("block"),
        Label(`In case of any questions, please send us an e-mail: support@bbn.one`).addClass("block"),
        Label(`Copyrights/Trademark rights`, "h3"),
        Label(`All rights to the texts, photos, graphics, video files and other objects on these Internet pages are protected by copyright.Their download, reproduction or use in other media or publications requires our written consent.All rights to all of the trademarks on this page belong exclusively to the owners of these trademark`).addClass("block")
    ).addClass("flow-text"),
    Footer()
)).appendOn(document.body);