import { z } from "zod/mini";

export const destinationPayload = z.object({
	latitude: z.number(),
	longitude: z.number(),
});
export type DestinationPayload = z.infer<typeof destinationPayload>;
