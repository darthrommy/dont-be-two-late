import { data } from "react-router";
import { BaseLayout } from "~/components/layout";
import { getCheck } from "~/features/check";
import { searchRoute } from "~/features/search";
import { getTaxiFare } from "~/features/taxi-fare";
import { getNearbyStation } from "~/lib/nearby.server";
import { getSessionId } from "~/lib/session.server";
import type { Route } from "./+types/route";

export const loader = async ({ request, context }: Route.LoaderArgs) => {
	const cookie = request.headers.get("Cookie") || "";
	const sessionId = getSessionId(cookie);

	if (!sessionId) {
		return data(null, 400);
	}

	const check = await getCheck(context.db, sessionId);

	if (!check) {
		return data(null, 404);
	}

	const fromNearby = await getNearbyStation(check.fromLon, check.fromLat);
	const toNearby = await getNearbyStation(check.destLon, check.destLat);

	if (!fromNearby.ok || !toNearby.ok) {
		return new Response(null, { status: 500 });
	}

	const route = await searchRoute(
		fromNearby.data,
		toNearby.data,
		context.cloudflare.env,
	);

	if (!route) {
		return new Response(null, { status: 500 });
	}

	const taxiFare = await getTaxiFare({
		from: {
			lat: check.fromLat,
			lon: check.fromLon,
		},
		to: {
			lat: check.destLat,
			lon: check.destLon,
		},
		apiKey: context.cloudflare.env.GOOGLE_MAPS_API_KEY,
	});

	return route;
};

export default function CheckPage({
	loaderData,
	actionData,
}: Route.ComponentProps) {
	return (
		<BaseLayout>
			<h1 className="text-4xl/none tracking-tight font-medium">
				Can I get the last trains?
			</h1>
			<div></div>
			<div></div>
		</BaseLayout>
	);
}

export const action = async ({ request, context }: Route.ActionArgs) => {
	return {};
};
