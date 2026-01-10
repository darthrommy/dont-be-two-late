import { getDbInstance } from "~/lib/db.server";

export const registerNotifiaction = async (
	estimationId: number,
	leaveTime: string,
) => {
	const scheduledAt = new Date(
		// 10 minutes before leave time
		new Date(leaveTime).getTime() - 10 * 60 * 1000,
	).toISOString();

	const db = getDbInstance();

	await db
		.insertInto("message_queue")
		.values({
			estimationId,
			scheduledAt,
		})
		.execute();
};
