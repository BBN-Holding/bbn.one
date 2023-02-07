import '../../polyfills.ts';
import { loadingWheel, Horizontal, PlainText, Spacer, Vertical, View, WebGen, Custom, Box, CenterV, Component, MaterialIcons, ViewClass, MediaQuery } from "webgen/mod.ts";
import '../../assets/css/main.css';
import '../../assets/css/music.css';
import { DynaNavigation } from "../../components/nav.ts";
import { GetCachedProfileData, ProfileData, Redirect, RegisterAuthRefresh, renewAccessTokenIfNeeded, showPreviewImage } from "./helper.ts";
import { API } from "./RESTSpec.ts";
import { loadSongs } from "./helper.ts";
import { ViewState } from "./types.ts";
import { ReviewPanel } from "./admin/reviews.ts";
import { ExplainerText } from "./music/text.ts";
import { ActionBar } from "./misc/actionbar.ts";
import { changeThemeColor } from "./misc/common.ts";
import { Drop, DropType } from "../../spec/music.ts";
WebGen({
    icon: new MaterialIcons(),
    events: {
        themeChanged: changeThemeColor()
    }
});
Redirect();
await RegisterAuthRefresh();

const view: ViewClass<ViewState> = View<ViewState>(({ state, update }) => Vertical(
    ActionBar(`Hi ${GetCachedProfileData().profile.username}! 👋`, [
        {
            title: `Published ${getListCount([ DropType.Published ], state)}`,
            selected: state.type == DropType.Published,
            onclick: () => update({ type: DropType.Published })
        },
        {
            title: `Unpublished ${getListCount([ DropType.UnderReview, DropType.Private, DropType.ReviewDeclined ], state)}`,
            selected: state.type == DropType.Private,
            onclick: () => update({ type: DropType.Private })
        },
        {
            title: `Drafts ${getListCount([ DropType.Unsubmitted ], state)}`,
            selected: state.type == DropType.Unsubmitted,
            onclick: () => update({ type: DropType.Unsubmitted }),
            hide: !state.list?.find(x => x.type == DropType.Unsubmitted)
        },
        {
            title: `Reviews (${state.reviews?.length})`,
            selected: state.type == DropType.UnderReview,
            onclick: () => update({ type: DropType.UnderReview }),
            hide: !(state.reviews && state.reviews?.length != 0)
        }
    ],
        {
            title: "Submit new Drop",
            onclick: async () => {
                const id = await API.music(API.getToken()).post();
                location.href = `/music/new-drop?id=${id}`;
            }
        }
    ),
    Box((() => {
        if (!state.list)
            return Custom(loadingWheel() as Element as HTMLElement);
        if (state.reviews && state.reviews.length != 0 && state.type == DropType.UnderReview)
            return ReviewPanel(() => view, state);
        return Vertical(
            CategoryRender(
                state.list
                    .filter(x => state.type == DropType.Published ? x.type == DropType.Published : true)
                    .filter(x => state.type == DropType.Private ? x.type == DropType.Private || x.type == DropType.UnderReview || x.type == DropType.ReviewDeclined : true)
                    .filter(x => state.type == DropType.Unsubmitted ? x.type == DropType.Unsubmitted : true)
                    .filter((_, i) => i == 0),
                "Latest Drop"
            ),
            CategoryRender(
                state.list
                    .filter(x => state.type == DropType.Published ? x.type == DropType.Published : true)
                    .filter(x => state.type == DropType.Private ? x.type == DropType.Private || x.type == DropType.UnderReview || x.type == DropType.ReviewDeclined : true)
                    .filter(x => state.type == DropType.Unsubmitted ? x.type == DropType.Unsubmitted : true)
                    .filter((_, i) => i > 0),
                "History"
            ),
            ExplainerText(state)
        )
            .setGap("20px");
    })()).addClass("loading"),
))
    .change(({ update }) => {
        update({ type: DropType.Published });
    });

View(() => Vertical(...DynaNavigation("Music"), view.asComponent())).appendOn(document.body);
renewAccessTokenIfNeeded().then(() => loadSongs(view));

function getListCount(list: Drop[ "type" ][], state: Partial<{ list: Drop[]; type: Drop[ "type" ]; aboutMe: ProfileData; }>) {
    const length = state.list?.filter(x => list.includes(x.type)).length;
    if (length) return `(${length})`;
    return "";
}


function CategoryRender(dropList: Drop[], title: string): Component | (Component | null)[] | null {
    if (dropList.length == 0)
        return null;
    return [
        PlainText(title)
            .addClass("list-title")
            .addClass("limited-width"),
        MediaQuery("(max-width: 700px)",
            (matches) =>
                Vertical(...dropList.map(x => DropEntry(x, matches))).setGap("1rem")
        ),
    ];
}

function DropEntry(x: Drop, matches: boolean): Component {
    return Horizontal(
        showPreviewImage(x),
        CenterV(
            PlainText(x.title ?? "(no name)")
                .setMargin("-0.4rem 0 0")
                .setFont(matches ? 1.2 : 2.25, 700),
            PlainText(x.release ?? "(no release date)")
                .setFont(matches ? 0.8 : 1, 700)
                .addClass("entry-subtitle")
        ),
        CenterV(
            PlainText(x.upc ? `UPC ${x.upc}` : "(no upc number)")
                .addClass("entry-subtitle")
                .setFont(matches ? 0.8 : 1, 700)
        ),
        Spacer(),
        x.type == DropType.UnderReview
            ? CenterV(PlainText("Under Review")
                .addClass("entry-subtitle", "under-review"))
            : null,
        x.type == DropType.ReviewDeclined
            ? CenterV(PlainText("Declined")
                .addClass("entry-subtitle", "under-review"))
            : null
    )
        .setGap("40px")
        .addClass("list-entry", "action", "limited-width")
        .onClick(() => x.type === DropType.Unsubmitted ? location.href = "/music/new-drop?id=" + x._id : location.href = "/music/edit?id=" + x._id);
}
