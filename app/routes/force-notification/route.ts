import { parseWithZod } from "@conform-to/zod/v4";
import { z } from "zod/mini";
import { createFcm } from "~/lib/fcm.server";
import type { Route } from "./+types/route";

export const action = async ({ request }: Route.ActionArgs) => {
	const formdata = await request.formData();
	const parsed = parseWithZod(formdata, {
		schema: z.object({
			token: z.string(),
		}),
	});

	if (parsed.status !== "success") {
		return new Response("Invalid payload", { status: 400 });
	}

	const { token } = parsed.value;

	const fcm = createFcm();
	await fcm.sendToTokens(
		{
			notification: {
				title: "Notification Demo",
				body: "This is a forced notification.",
			},
			data: {
				click_action: "/estimate",
			},
		},
		[token],
	);

	return new Response("Notification sent", { status: 200 });
};
