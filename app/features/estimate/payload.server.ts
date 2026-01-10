import { z } from "zod/mini";

export const coordinatePayload = z.object({
	latitude: z.number(),
	longitude: z.number(),
	token: z.string(),
});
export type CoordinatePayload = z.infer<typeof coordinatePayload>;
