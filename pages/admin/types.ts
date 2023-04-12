import { Drop } from "../../spec/music.ts";
import { ProfileData } from "../manager/helper.ts";

export type ViewState = {
    users: ProfileData[];
    reviews: Drop[];
    usersearch: string;
    type: "users" | "reviews";
};
