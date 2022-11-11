import { loadingWheel, Horizontal, PlainText, Spacer, Vertical, View, WebGen, Custom, Box, img, CenterV, Component, MaterialIcons, ViewClass } from "webgen/mod.ts";
import '../../assets/css/main.css';
import '../../assets/css/music.css';
import { DynaNavigation } from "../../components/nav.ts";
import { GetCachedProfileData, MediaQuery, ProfileData, ReCache, Redirect, RegisterAuthRefresh, renewAccessTokenIfNeeded, showPreviewImage } from "./helper.ts";
import { API, Drop } from "./RESTSpec.ts";
import { loadSongs } from "./helper.ts";
import { ViewState } from "./types.ts";
import { ReviewPanel } from "./admin/reviews.ts";
import { ExplainerText } from "./music/text.ts";
import { ActionBar } from "./misc/actionbar.ts";
import { changeThemeColor } from "./misc/common.ts";
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
            title: `Published ${getListCount([ "PUBLISHED" ], state)}`,
            selected: state.type == "PUBLISHED",
            onclick: () => update({ type: "PUBLISHED" })
        },
        {
            title: `Unpublished ${getListCount([ "UNDER_REVIEW", "PRIVATE", "REVIEW_DECLINED" ], state)}`,
            selected: state.type == "PRIVATE",
            onclick: () => update({ type: "PRIVATE" })
        },
        {
            title: `Drafts ${getListCount([ "UNSUBMITTED" ], state)}`,
            selected: state.type == "UNSUBMITTED",
            onclick: () => update({ type: "UNSUBMITTED" }),
            hide: !state.list?.find(x => x.type == "UNSUBMITTED")
        },
        {
            title: `Reviews (${state.reviews?.length})`,
            selected: state.type == "UNDER_REVIEW",
            onclick: () => update({ type: "UNDER_REVIEW" }),
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
        if (state.reviews && state.reviews.length != 0 && state.type == "UNDER_REVIEW")
            return ReviewPanel(() => view, state);
        return Vertical(
            CategoryRender(
                state.list
                    .filter(x => state.type == "PUBLISHED" ? x.type == "PUBLISHED" : true)
                    .filter(x => state.type == "PRIVATE" ? x.type == "PRIVATE" || x.type == "UNDER_REVIEW" || x.type == "REVIEW_DECLINED" : true)
                    .filter(x => state.type == "UNSUBMITTED" ? x.type == "UNSUBMITTED" : true)
                    .filter((_, i) => i == 0),
                "Latest Drop"
            ),
            CategoryRender(
                state.list
                    .filter(x => state.type == "PUBLISHED" ? x.type == "PUBLISHED" : true)
                    .filter(x => state.type == "PRIVATE" ? x.type == "PRIVATE" || x.type == "UNDER_REVIEW" || x.type == "REVIEW_DECLINED" : true)
                    .filter(x => state.type == "UNSUBMITTED" ? x.type == "UNSUBMITTED" : true)
                    .filter((_, i) => i > 0),
                "History"
            ),
            ExplainerText(state)
        )
            .setGap("20px");
    })()).addClass("loading"),
))
    .change(({ update }) => {
        update({ type: "PUBLISHED" });
    });

View(() => Vertical(...DynaNavigation("Music"), view.asComponent())).appendOn(document.body);
renewAccessTokenIfNeeded(GetCachedProfileData().exp).then(() => loadSongs(view));

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
        x.type == "UNDER_REVIEW"
            ? CenterV(PlainText("Under Review")
                .addClass("entry-subtitle", "under-review"))
            : null,
        x.type == "REVIEW_DECLINED"
            ? CenterV(PlainText("Declined")
                .addClass("entry-subtitle", "under-review"))
            : null
    )
        .setGap("40px")
        .addClass("list-entry", "action", "limited-width")
        .onClick(() => x.type === "UNSUBMITTED" ? location.href = "/music/new-drop?id=" + x._id : location.href = "/music/edit?id=" + x._id);
}
