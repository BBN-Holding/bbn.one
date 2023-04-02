import { Box, CenterV, Custom, Grid, Icon, MediaQuery, PlainText, Reactive, Spacer, State, loadingWheel } from "webgen/mod.ts";

export function Entry(text: string, subtext?: string, action?: () => Promise<void> | void) {
    const state = State({
        isLoading: false
    });
    const item = CenterV(Icon("arrow_forward_ios")).draw();
    const actionIcon = Reactive(state, "isLoading", () =>
        state.isLoading ? Box(Custom(loadingWheel() as Element as HTMLElement)).addClass("loading")
            : Custom(item)
    ).addClass("action-item");
    return MediaQuery("(max-width: 520px)", (small) =>
        Grid(
            CenterV(
                PlainText(text)
                    .setFont(small ? 1.3 : 1.5, 700),
                ...subtext ? [
                    Spacer(),
                    PlainText(subtext)
                        .setFont(small ? .8 : 1, 700)
                        .addClass("subtitle")
                ] : []
            )
                .addClass("meta-data"),
            action ? actionIcon : Spacer()
        )
            .setRawColumns("auto max-content")
            .onClick((() => {
                if (!action) return;
                console.log(action);
                state.isLoading = true;
                action()?.then(() => { state.isLoading = false; });
            }))
            .setPadding(small ? "10px 18px" : "18px 24px")
            .addClass("list-entry", action ? "action" : "no-actions", "limited-width")
    );
}
