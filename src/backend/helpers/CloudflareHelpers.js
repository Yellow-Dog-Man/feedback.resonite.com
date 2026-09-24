export const IP_HEADER = "cf-connecting-ip";

export function GetClientIp(c) {
    return c.req.header(IP_HEADER) ?? "";
}