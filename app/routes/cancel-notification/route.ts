import { parseWithZod } from "@conform-to/zod/v4";
import { data } from "react-router";
import { z } from "zod/mini";
import { cancelNotification } from "~/features/notify";
import type { Route } from "../../+types/root";

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

	await cancelNotification(parsed.value.token);

	return data({ success: true }, { status: 200 });
};
