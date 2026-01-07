import type { Insertable } from "kysely";
import type { DBInstance, T_Checking } from "~/lib/db.server";

export const updateCheck = async (
	db: DBInstance,
	payload: Insertable<T_Checking>,
) => {
	// update the latest check for the session
	const update = db.insertInto("checking").values(payload);
	await update.execute();
};
