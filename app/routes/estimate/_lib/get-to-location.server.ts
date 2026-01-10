import { getDbInstance } from "~/lib/db.server";

export const getDestination = async (token: string) => {
	const db = getDbInstance();

	const query = db
		.selectFrom("destination")
		.select(["latitude", "longitude", "id"])
		.where("token", "=", token)
		.orderBy("createdAt", "desc")
		.limit(1);

	const result = await query.executeTakeFirstOrThrow();

	return result;
};
