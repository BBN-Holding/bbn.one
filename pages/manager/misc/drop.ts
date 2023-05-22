import { API } from "shared";
import { Drop } from "../../../spec/music.ts";

export async function DownloadDrop(x: Drop) {
    if ((x.songs?.length ?? 0) != 0) {
        const { code } = await API.music(API.getToken()).id(x._id).songSownload();
        window.open(`${API.BASE_URL}music/${x._id}/songs-download/${code}`, '_blank');
    }
}