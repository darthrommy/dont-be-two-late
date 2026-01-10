import type { CoordinatePayload } from "~/features/estimate";
import { getDbInstance } from "~/lib/db.server";

/**
 * Store destination coordinates in the database and create a new session
 */
export const storeDestination = async (payload: CoordinatePayload) => {
	const db = getDbInstance();

	await db
		.insertInto("destination")
		.values({
			token: payload.token,
			latitude: payload.latitude,
			longitude: payload.longitude,
		})
		.execute();
};
