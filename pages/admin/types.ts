import { Drop, Payout } from "../../spec/music.ts";
import { ProfileData } from "../manager/helper.ts";

export type ViewState = {
    users: ProfileData[];
    reviews: Drop[];
    usersearch: string;
    payouts: Payout[];
    type: "overview" | "users" | "reviews" | "payouts";
};
