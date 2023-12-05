import { API, stupidErrorAlert } from "shared/mod.ts";
import { DropType } from "../../spec/music.ts";
import { state } from "./state.ts";

export async function refreshState() {
    const list = await API.music.drops.list().then(stupidErrorAlert);

    state.published = list.filter(x => x.type === DropType.Published);
    state.drafts = list.filter(x => x.type === DropType.Unsubmitted);
    state.unpublished = list.filter(x =>
        x.type === DropType.UnderReview
        || x.type === DropType.Private
        || x.type === DropType.ReviewDeclined
    );
    state.payouts = await API.payment.payouts.get().then(stupidErrorAlert);
}