import { getDbInstance } from "~/lib/db.server";

export const getNotification = async (token: string) => {
	const db = getDbInstance();

	const notification = await db
		.selectFrom("message_queue as q")
		.innerJoin("estimation as e", "q.estimationId", "e.id")
		.innerJoin("destination as d", "e.destinationId", "d.id")
		.select("q.id")
		.where("d.token", "=", token)
		.where("q.canceledAt", "is", null)
		.executeTakeFirst();

	return notification;
};
