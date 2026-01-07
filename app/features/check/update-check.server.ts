import type { DBInstance } from "~/lib/db.server";

export const updateCheck = async (
	db: DBInstance,
	sessionId: string,
	fromLat: number,
	fromLon: number,
) => {
	// update the latest check for the session
	const update = db.insertInto("checking").values({
		sessionId,
		fromLat,
		fromLon,
	});

	await update.execute();
};
