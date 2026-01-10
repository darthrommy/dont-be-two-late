import { getPurgeFcmTokenCookieHeader } from "~/features/notify";
import type { Route } from "./+types/route";

export const action = async (_: Route.ActionArgs) => {
	const cookieHeader = getPurgeFcmTokenCookieHeader();
	return new Response(null, {
		status: 204,
		headers: {
			"Set-Cookie": cookieHeader,
		},
	});
};
