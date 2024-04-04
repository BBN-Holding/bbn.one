import { API, fileCache, Permission, stupidErrorAlert, Table2 } from "shared/mod.ts";
import { asRef, asState, Box, Button, ButtonStyle, Cache, CenterV, Component, Custom, DropDownInput, Grid, Horizontal, IconButton, Image, Items, Label, Layer, MIcon, Reference, refMerge, SheetDialog, SheetsStack, Spacer, Style, SupportedThemes, TextInput, Vertical } from "webgen/mod.ts";
import { Popover } from "webgen/src/components/Popover.ts";
import { templateArtwork } from "../../assets/imports.ts";
import { loginRequired } from "../../components/pages.ts";
import { Artist, ArtistRef, ArtistTypes, Drop } from "../../spec/music.ts";

export const allowedAudioFormats = ["audio/flac", "audio/wav", "audio/mp3"];
export const allowedImageFormats = ["image/png", "image/jpeg"];

export type ProfileData = {
    _id: string;
    profile: {
        email: string;
        verified?: {
            email?: boolean;
        };
        username: string;
        avatar?: string;
    };
    permissions: Permission[];
    groups: string[];
};

export function IsLoggedIn(): ProfileData | null {
    try {
        return localStorage["access-token"] ? JSON.parse(b64DecodeUnicode(localStorage["access-token"].split(".")[1])).user : null;
    } catch (_) {
        // Invalid state. We gonna need to say goodbye to that session
        resetTokens();
        return null;
    }
}

export function changeThemeColor(): ((data: SupportedThemes, options: Style) => void) | undefined {
    return (_data) => {}; // document.head.querySelector("meta[name=theme-color]")?.setAttribute("content", data == SupportedThemes.autoLight ? "#e6e6e6" : "#0a0a0a");
}

export function getSecondary(secondary: Record<string, string[]>, primaryGenre?: string) {
    return primaryGenre ? secondary[primaryGenre] : null;
}

function b64DecodeUnicode(value: string) {
    // Going backwards: from bytestream, to percent-encoding, to original string.
    return decodeURIComponent(atob(value).split("").map((c) => `%${(`00${c.charCodeAt(0).toString(16)}`).slice(-2)}`).join(""));
}
function rawAccessToken() {
    return JSON.parse(b64DecodeUnicode(localStorage["access-token"].split(".")[1]));
}

export const activeUser = asState({
    email: <string | undefined> undefined,
    username: <string> "--",
    avatar: <string | undefined> undefined,
    permission: <Permission[]> [],
    id: <string | undefined> undefined,
});

export function permCheck(...per: Permission[]) {
    return API.isPermited(per, activeUser.permission);
}

export function updateActiveUserData() {
    try {
        const user = IsLoggedIn();
        if (!user) return;
        activeUser.username = user.profile.username;
        activeUser.email = user.profile.email;
        activeUser.avatar = user.profile.avatar;
        activeUser.id = user._id;
        activeUser.permission = asState(user.permissions);
    } catch (_) {
        // Session should be invalid
        logOut();
    }
}

function checkIfRefreshTokenIsValid() {
    const token = localStorage["refresh-token"];
    if (!token) return;
    const tokenData = JSON.parse(b64DecodeUnicode(token.split(".")[1]));
    if (isExpired(tokenData.exp)) {
        logOut();
        return;
    }
}
export function logOut(goal?: string) {
    if (location.pathname.startsWith("/signin")) return;
    resetTokens();
    location.href = "/signin";
    localStorage.goal = goal ?? "/c/music";
}

export function resetTokens() {
    localStorage.removeItem("refresh-token");
    localStorage.removeItem("access-token");
    localStorage.removeItem("goal");
}

export function gotoGoal() {
    location.href = localStorage.goal || "/c/music";
}

export async function renewAccessTokenIfNeeded() {
    if (!localStorage.getItem("access-token")) return;
    const { exp } = rawAccessToken();
    if (!exp) return logOut();
    // We should renew the token 30s before it expires
    if (isExpired(exp)) {
        await forceRefreshToken();
    }
}

export const tokens = asState({
    accessToken: localStorage["access-token"],
    refreshToken: localStorage["refresh-token"],
});

export async function forceRefreshToken() {
    try {
        const access = await API.auth.refreshAccessToken.post(localStorage["refresh-token"]).then(stupidErrorAlert);
        localStorage["access-token"] = access.token;
        tokens.accessToken = access.token;
    } catch (_) {
        // TODO: Make a better offline support
        location.href = "/";
    }
}

function isExpired(exp: number) {
    return exp * 1000 < new Date().getTime() + (0.5 * 60 * 1000);
}

export async function RegisterAuthRefresh() {
    if (!IsLoggedIn()) return shouldLoginPage();
    try {
        updateActiveUserData();
        checkIfRefreshTokenIsValid();
        await renewAccessTokenIfNeeded();
        setInterval(() => renewAccessTokenIfNeeded(), 1000);
    } catch (error) {
        console.error(error);
    }
}

export function shouldLoginPage() {
    if (!loginRequired.find((x) => location.pathname.startsWith(x))) {
        return;
    }
    localStorage.goal = location.pathname + location.search;
    location.href = "/signin";
    throw "aborting javascript here";
}

export function CenterAndRight(center: Component, right: Component): Component {
    return Horizontal(
        Spacer(),
        Spacer(),
        CenterV(center),
        Spacer(),
        right,
    );
}

export const sheetStack = SheetsStack()
    .setSheetWidth("auto")
    .setSheetHeight("auto");

export function getYearList(): string[] {
    return new Array(new Date().getFullYear() - 2000 + 1)
        .fill(1)
        .map((_, i) => (new Date().getFullYear()) - i)
        .map((x) => x.toString());
}

const a = document.createElement("a");
document.body.appendChild(a);
a.setAttribute("style", "display: none");

export function saveBlob(blob: Blob, fileName: string) {
    const url = window.URL.createObjectURL(blob);
    a.href = url;
    a.download = fileName;
    a.click();
    window.URL.revokeObjectURL(url);
}

const createArtistSheet = (name?: string) => {
    const state = asState({
        name,
        spotify: <string | undefined> undefined,
        apple: <string | undefined> undefined,
    });
    return SheetDialog(
        sheetStack,
        "Create Artist",
        Grid(
            TextInput("text", "Artist Name").sync(state, "name"),
            TextInput("text", "Spotify URL").sync(state, "spotify"),
            TextInput("text", "Apple Music URL").sync(state, "apple"),
            Button("Create").onPromiseClick(async () => {
                await API.music.artists.create(state);
                createArtistSheet().close();
            }),
        ).setGap(),
    );
};

const DropDownSearch = (artist: Reference<ArtistRef>, artists: Reference<Artist[]>) => {
    const content = asRef(Box());
    const search = asRef("");
    const ref = refMerge({ artist, artists });
    const button = Button(ref.map((a) => (a.artists.find((b) => b._id == a.artist._id) ?? { name: "Select Artist" }).name))
        .setWidth("100%");

    const dropDownPopover = Popover(
        Layer(
            content.asRefComponent(),
            5,
        ).setBorderRadius("mid").addClass("wdropdown-outer-layer"),
    )
        .pullingAnchorPositioning("--wdropdown-default", (rect, style) => {
            style.top = `max(-5px, ${rect.bottom}px)`;
            style.left = `${rect.left}px`;
            style.minWidth = `${rect.width}px`;
            style.bottom = "var(--gap)";
        });

    button.onClick(() => {
        if (dropDownPopover.isOpen()) {
            dropDownPopover.hidePopover();
            return;
        }
        dropDownPopover.clearAnchors("--wdropdown-default");
        button.setAnchorName("--wdropdown-default");
        dropDownPopover.showPopover();

        content.setValue(
            Vertical(
                //TODO: use color-mix upstream ig
                TextInput("text", "Search")
                    .onChange((x) => search.setValue(x!)),
                search.map((s) =>
                    Grid(
                        Items(artists.map((x) => x.map((y) => y.name).filter((x) => x.includes(s))), (item) =>
                            ref.map((ref) =>
                                Button(item)
                                    .setStyle(ButtonStyle.Inline)
                                    .onClick(() => {
                                        artist.setValue({ _id: ref.artists.find((x) => x.name == item)!._id, type: ref.artist.type });
                                        dropDownPopover.hidePopover();
                                        search.setValue("");
                                    })
                            ).asRefComponent()),
                    )
                        .addClass("wdropdown-content")
                        .setDirection("row")
                        .setGap("5px")
                        .setPadding("5px")
                ).asRefComponent(),
                Button("Create Artist")
                    .addPrefix(MIcon("add"))
                    .setStyle(ButtonStyle.Inline)
                    .onClick(() => {
                        createArtistSheet(search.getValue()).open();
                        dropDownPopover.hidePopover();
                        search.setValue("");
                    }),
            ),
        );
    });

    return button;
};

const ARTIST_ARRAY = <ArtistTypes[]> ["PRIMARY", "FEATURING", "PRODUCER", "SONGWRITER"];
export const EditArtistsDialog = (artists: Reference<ArtistRef[]>) => {
    const artistList = asRef(<Artist[]> []);

    API.music.artists.list().then(stupidErrorAlert)
        .then((x) => {
            artistList.setValue(x);
        });

    const dialog = SheetDialog(
        sheetStack,
        "Manage your Artists",
        Vertical(
            new Table2(artists)
                .addClass("artist-table")
                .setColumnTemplate("10rem 10rem min-content")
                .addColumn("Type", (artist) =>
                    DropDownInput("Type", ARTIST_ARRAY)
                        .setValue(artist.type)
                        .onChange((data) => artist.type = <ArtistTypes> data))
                .addColumn("Name", (artist) => DropDownSearch(artist, artistList))
                .addColumn("", (data) => IconButton(MIcon("delete"), "Delete").onClick(() => artists.setValue(artists.filter((_, i) => i != artists.indexOf(data)) as typeof state))),
            Horizontal(
                Spacer(),
                Button("Add Artist")
                    .onClick(() => artists.setValue([...artists.getValue(), { type: ArtistTypes.Primary, _id: "" }] as ArtistRef[])),
            ).setPadding("0 0 3rem 0"),
            Horizontal(
                Spacer(),
                Button("Save")
                    .onClick(() => dialog.close()),
            ),
        ),
    );

    return dialog;
};

export function showPreviewImage(x: Drop) {
    return x.artwork ? Cache(`image-preview-${x.artwork}`, () => Promise.resolve(), (type) => type == "loaded" ? Image({ type: "direct", source: () => loadImage(x) }, "A Song Artwork") : Box()) : Image(templateArtwork, "A Placeholder Artwork.");
}

async function loadImage(x: Drop) {
    const cache = await fileCache();
    if (await cache.has(`image-preview-${x.artwork}`)) {
        return await cache.get(`image-preview-${x.artwork}`)!;
    }
    const blob = await API.music.id(x._id).artwork().then(stupidErrorAlert);
    await cache.set(`image-preview-${x.artwork}`, blob);
    return blob;
}

export function stringToColor(str: string) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    let color = "#";
    for (let i = 0; i < 3; i++) {
        const value = (hash >> (i * 8)) & 0xFF;
        color += (`00${value.toString(16)}`).slice(-2);
    }
    return color;
}

export function ProfilePicture(component: Component, name: string) {
    const ele = component.draw();
    ele.style.backgroundColor = stringToColor(name);
    return Custom(ele).addClass("profile-picture");
}

export function getNameInital(name: string) {
    if (name.includes(", ")) {
        return name.split(", ").map((x) => x.at(0)?.toUpperCase()).join("");
    }
    if (name.includes(",")) {
        return name.split(",").map((x) => x.at(0)?.toUpperCase()).join("");
    }
    if (name.includes(" ")) {
        return name.split(" ").map((x) => x.at(0)?.toUpperCase()).join("");
    }
    return name.at(0)!.toUpperCase();
}

export function showProfilePicture(x: ProfileData) {
    return ProfilePicture(
        x.profile.avatar
            ? Image({
                type: "direct",
                source: async () => {
                    const blob = new Blob();

                    const data = await API.user.picture(x._id);

                    if (data.status == "fulfilled") {
                        return data.value;
                    }

                    return blob;
                },
            }, "Profile Picture")
            : Label(getNameInital(x.profile.username)),
        x.profile.username,
    );
}
