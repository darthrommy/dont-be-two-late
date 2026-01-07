import { v4 as uuidv4 } from "uuid";
import { getDbInstance } from "~/lib/db.server";
import type { DestinationPayload } from "./payload.server";

/**
 * Store destination coordinates in the database and create a new session
 * @returns Generated session ID
 */
export const storeDestination = async (
	payload: DestinationPayload,
	env: Env,
) => {
	const sessionId = uuidv4();
	const db = getDbInstance(env);

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
