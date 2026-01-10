import { getDbInstance } from "~/lib/db.server";

/**
 *  Cancels all pending notifications for the given FCM token.
 * @param token The FCM token associated with the notifications to cancel.
 */
export const cancelNotification = async (token: string) => {
	const db = getDbInstance();
	const now = new Date().toISOString();

	await db
		.updateTable("message_queue")
		.set({ canceledAt: now })
		.where("estimationId", "in", (eb) =>
			eb
				.selectFrom("estimation")
				.select("id")
				.where("destinationId", "in", (eb2) =>
					eb2.selectFrom("destination").select("id").where("token", "=", token),
				),
		)
		.where("canceledAt", "is", null)
		.execute();
};
