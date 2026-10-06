import type { AppContext } from "../types";

export const IP_HEADER = "cf-connecting-ip";

export function GetClientIp(c: AppContext) {
	return c.req.header(IP_HEADER) ?? "0.0.0.0"; // In Dev, this is often blank for some reason.
}
