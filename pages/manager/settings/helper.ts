export type ViewState = {
    mode: "change-password" | "landing-page" | "change-personal";
};
export function returnFunction(update: (data: Partial<ViewState>) => void) {
    return [ { title: "Settings", onclick: () => update({ mode: "landing-page" }) } ];
}
