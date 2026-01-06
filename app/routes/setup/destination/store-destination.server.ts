import { v4 as uuidv4 } from "uuid";
import { getDbInstance } from "~/lib/db.server";

type Options = {
	env: Env;
	destLat: number;
	destLon: number;
};

/**
 * Store destination coordinates in the database and create a new session
 * @param param0 Destination latitude and longitude along with environment variables
 * @returns Generated session ID
 */
export const storeDestination = async ({ destLat, destLon, env }: Options) => {
	const sessionId = uuidv4();
	const db = getDbInstance(env);
	await db
		.insertInto("session")
		.values({ id: sessionId, destLat, destLon })
		.execute();
	return sessionId;
};
