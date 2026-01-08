import type { DBInstance } from "~/lib/db.server";

export const getCheck = async (db: DBInstance, sessionId: string) => {
	// get the latest check for the session
	const query = db
		.selectFrom("checking as c")
		.innerJoin("session as s", "s.id", "c.sessionId")
		.select([
			"c.departureTime",
			"c.fare",
			"c.sessionId",
			"c.operatorId",
			"c.stationId",
			"s.destLat",
			"s.destLon",
		])
		.where("c.sessionId", "=", sessionId)
		.limit(1)
		.orderBy("c.createdAt", "desc");

	const check = await query.executeTakeFirst();

	return check ?? null;
};
