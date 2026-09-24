import { Context } from "hono";

export const IP_HEADER = "cf-connecting-ip";

export function GetClientIp(c: Context) {
    return c.req.header(IP_HEADER) ?? "";
}