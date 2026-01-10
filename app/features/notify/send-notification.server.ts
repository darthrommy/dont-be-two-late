import { getDbInstance } from "~/lib/db.server";
import { createFcm } from "~/lib/fcm.server";

export const sendNotification = async () => {
	const db = getDbInstance();

	const now = Date.now();
	const nowWithoutSeconds = new Date(
		new Date(now).setSeconds(0, 0),
	).toISOString();

	const queues = await db
		.selectFrom("message_queue as q")
		.innerJoin("estimation as e", "q.estimationId", "e.id")
		.innerJoin("destination as d", "e.destinationId", "d.id")
		.select(["q.id", "e.leaveTime", "d.token"])
		.where("q.scheduledAt", "=", nowWithoutSeconds)
		// Ensure we only pick unsent and uncanceled notifications
		.where("q.sentAt", "is", null)
		.where("q.canceledAt", "is", null)
		.execute();

	const fcm = createFcm();

	const batchResult = await Promise.allSettled(
		queues.map(async ({ id, token, leaveTime }) => {
			try {
				await fcm.sendToToken(
					{
						notification: {
							title: "Hey! It's about time to leave!",
							body: `Leave by ${new Date(leaveTime).toLocaleTimeString([], {
								hour: "2-digit",
								minute: "2-digit",
							})} to reach your destination on time.`,
						},
						data: {
							click_action: "/estimate",
						},
					},
					token,
				);
				return id;
			} catch (e) {
				console.error(`Failed to send notification to token ${token}:`, e);
				return id;
			}
		}),
	);

	const successTokens = batchResult.flatMap((result) =>
		result.status === "fulfilled" ? [result.value] : [],
	);

	// Update sentAt for successfully sent notifications
	await db
		.updateTable("message_queue")
		.set({
			sentAt: new Date().toISOString(),
		})
		.where("id", "in", successTokens)
		.execute();
};
