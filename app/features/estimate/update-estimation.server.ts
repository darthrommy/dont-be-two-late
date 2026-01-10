import type { Insertable } from "kysely";
import { getDbInstance, type T_Estimation } from "~/lib/db.server";

export const updateEstimation = async (payload: Insertable<T_Estimation>) => {
	const db = getDbInstance();

	// destructure the payload for safer usage
	const {
		stationId,
		fare,
		departureTime,
		destinationId,
		originLatitude,
		originLongitude,
		leaveTime,
		taxiFare,
	} = payload;

	// update the latest check for the session
	const update = db
		.insertInto("estimation")
		.values({
			stationId,
			fare,
			departureTime,
			destinationId,
			originLatitude,
			originLongitude,
			leaveTime,
			taxiFare,
		})
		.returning("id");

	const newRow = await update.executeTakeFirstOrThrow();
	return newRow.id;
};
