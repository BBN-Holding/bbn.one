import { DropType } from "../../../spec/music.ts";

export function DropTypeToText(type?: DropType) {
    return (<Record<DropType, string>>{
        "PRIVATE": "Private",
        "PUBLISHED": "Published",
        "UNDER_REVIEW": "Under Review",
        "UNSUBMITTED": "Draft",
        "REVIEW_DECLINED": "Rejected"
    })[ type ?? DropType.Unsubmitted ] ?? "";
}