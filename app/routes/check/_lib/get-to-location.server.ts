import type { DBInstance } from "~/lib/db.server";

export const getToLocation = async (db: DBInstance, sessionId: string) => {
	const query = db
		.selectFrom("session")
		.select(["destLat", "destLon"])
		.where("id", "=", sessionId)
		.limit(1);

	const result = await query.executeTakeFirstOrThrow();

	return result;
};
