import { getDbInstance } from "~/lib/db.server";

export const getEstimation = async (token: string) => {
	const db = getDbInstance();
	// get the latest check for the session
	const query = db
		.selectFrom("estimation as e")
		.innerJoin("destination as d", "e.destinationId", "d.id")
		.select([
			"e.stationId",
			"e.departureTime",
			"e.leaveTime",
			"e.originLatitude",
			"e.originLongitude",
			"e.fare",
			"e.taxiFare",
			"d.latitude as destinationLatitude",
			"d.longitude as destinationLongitude",
		])
		.where("d.token", "=", token)
		.orderBy("d.createdAt", "desc")
		.limit(1);

	const check = await query.executeTakeFirstOrThrow();

	return check;
};
