import { purgeSession } from "~/lib/session.server";
import type { Route } from "./+types/route";

export const action = async (_: Route.ActionArgs) => {
	const cookieHeader = purgeSession();
	return new Response(null, {
		status: 201,
		headers: {
			"Set-Cookie": cookieHeader,
		},
	});
};
