import { API } from "../RESTSpec.ts";

const para = new URLSearchParams(location.search);
const { brand_id, locale_id, return_to, timestamp } = {
    brand_id: para.get("brand_id"),
    locale_id: para.get("locale_id"),
    return_to: para.get("return_to"),
    timestamp: para.get("timestamp")
};

const jwt = await API.user(API.getToken()).zendesk.post()

location.href = `https://bbn6775.zendesk.com/access/jwt?jwt=${jwt.jwt}}&return_to=${return_to}`;