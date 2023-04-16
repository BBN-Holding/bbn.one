import { Button, ButtonStyle, CenterV, Color, Component, Horizontal, MediaQuery, PlainText, Spacer, UploadFilesDialog, Vertical } from "https://raw.githubusercontent.com/lucsoft/WebGen/3f922fc/mod.ts";
import { ViewState } from "./types.ts";
import { delay } from "https://deno.land/std@0.177.0/async/delay.ts";
import { API } from "../manager/RESTSpec.ts";
import { StreamingUploadHandler } from "../manager/upload.ts";
import { Payout } from "../../spec/music.ts";

export function PayoutPanel(state: Partial<ViewState>): Component {
    return Vertical(
        Horizontal(
            Button("Manual Upload")
                .onClick(() => UploadFilesDialog((list) => {
                    console.log(list);
                    StreamingUploadHandler(`music/payout/upload`, {
                        failure: () => {
                            //state.loading = false;
                            alert("Your Upload has failed. Please try a different file or try again later");
                        },
                        uploadDone: () => {
                            console.log("Upload done")
                        },
                        credentials: () => API.getToken(),
                        backendResponse: (id) => {
                            console.log(id);
                        },
                        onUploadTick: async (percentage) => {
                            console.log(percentage);
                            await delay(2);
                        }
                    }, list[0].file);
                }, '.xlsx')).setMargin("0 0.5rem 0 0"),
            Button("Sync ISRCs")
                .onClick(() => UploadFilesDialog((list) => {
                    console.log(list);
                    StreamingUploadHandler(`music/payout/isrcsync`, {
                        failure: () => {
                            //state.loading = false;
                            alert("Your Upload has failed. Please try a different file or try again later");
                        },
                        uploadDone: () => {
                            console.log("Upload done")
                        },
                        credentials: () => API.getToken(),
                        backendResponse: (id) => {
                            console.log(id);
                        },
                        onUploadTick: async (percentage) => {
                            console.log(percentage);
                            await delay(2);
                        }
                    }, list[0].file);
                }, '.xlsx')),
        ),
        state.payouts ? [
            PlainText("Payouts")
                .addClass("list-title")
                .addClass("limited-width"),
            Vertical(state.payouts!.map(x => RenderEntry(x))).setGap("1rem"),
        ] : [
            PlainText("No Payouts")
                .addClass("list-title")
                .addClass("limited-width"),
            PlainText("All done! You are now allowed to lean back and relax. 🧋")
                .addClass("limited-width"),
        ],
    )
}

function RenderEntry(x: Payout) {
    return MediaQuery("(max-width: 880px)", (small) => small ? Vertical(
        Horizontal(
            Vertical(
                PlainText(x._id ?? "(no text)")
                    .setMargin("-0.4rem 0 0")
                    .setFont(2, 700),
                PlainText(x.importer + " - " + x.file),
            ),
            Spacer()
        ),
        Horizontal(
            Spacer(),
            CenterV(
                Button("Edit")
                    .setStyle(ButtonStyle.Inline)
                    .setColor(Color.Colored)
                    .addClass("tag")
                    .onClick(() => location.href = "/music/edit?id=" + x._id)
            ),
        )
    ).setPadding("0.5rem")
        .setGap("0.8rem")
        .addClass("list-entry")
        .addClass("limited-width")
        :
        Horizontal(
            Vertical(
                PlainText(x._id ?? "(no text)")
                    .setMargin("-0.4rem 0 0")
                    .setFont(2, 700),
                PlainText(x.importer + " - " + x.file),
            ),
            Spacer(),
            CenterV(
                Button("Edit")
                    .setStyle(ButtonStyle.Inline)
                    .setColor(Color.Colored)
                    .addClass("tag")
                    .onClick(() => location.href = "/admin/useredit?id=" + x._id)
            ),
        )
            .setPadding("0.5rem")
            .addClass("list-entry")
            .addClass("limited-width")
    );
}