import type { ZodMiniObject } from "zod/mini";

export type DataName = `odpt:${string}`;

export type EndpointConfig = {
	name: DataName;
	params: ZodMiniObject;
	data: ZodMiniObject;
};
