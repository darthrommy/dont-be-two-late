import { v4 as uuidv4 } from "uuid";
import type { CoordinatePayload } from "~/features/check";
import { getDbInstance } from "~/lib/db.server";

/**
 * Store destination coordinates in the database and create a new session
 * @returns Generated session ID
 */
export const storeDestination = async (payload: CoordinatePayload) => {
	const sessionId = uuidv4();
	const db = getDbInstance();

	await db
		.insertInto("session")
		.values({
			id: sessionId,
			destLat: payload.latitude,
			destLon: payload.longitude,
		})
		.execute();

	return sessionId;
};
