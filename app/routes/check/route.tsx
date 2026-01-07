import { parseWithZod } from "@conform-to/zod/v4";
import { RefreshCwIcon, RouteIcon } from "lucide-react";
import { useCallback } from "react";
import { redirect, useFetcher } from "react-router";
import { ButtonLink, buttonStyle } from "~/components/button-link";
import { BaseLayout } from "~/components/layout";
import {
	type CoordinatePayload,
	coordinatePayload,
	getCheck,
	updateCheck,
} from "~/features/check";
import { searchRoute } from "~/features/search";
import { getNearbyStation } from "~/lib/nearby.server";
import { getSessionId } from "~/lib/session.server";
import { cn } from "~/lib/utils";
import type { Route } from "./+types/route";

type CheckStatus = "safe" | "advised" | "hurry";
const CHECK_TEXT = {
	safe: {
		statusText: "Definately, Yes.",
		statusColor: "text-green-500",
		description: "You still have enough time.",
	},
	advised: {
		statusText: "Leave now!",
		statusColor: "text-amber-500",
		description:
			"You're about to miss the 2nd train before the last. Leave now with a relaxed mind.",
	},
	hurry: {
		statusText: "Hurry Up!!!",
		statusColor: "text-red-500",
		description:
			"You're about to miss the REAL last train!!! Just leave now to save money!!!",
	},
} as const satisfies {
	[key in CheckStatus]: {
		statusText: string;
		statusColor: string;
		description: string;
	};
};

export const loader = async ({ request, context }: Route.LoaderArgs) => {
	const cookie = request.headers.get("Cookie") || "";
	const sessionId = getSessionId(cookie);

	if (!sessionId) {
		return redirect("/setup/destination");
	}

	// get current availability
	const check = await getCheck(context.db, sessionId);

	if (!check) {
		throw new Response(null, { status: 404 });
	}

	const fromNearby = await getNearbyStation(check.fromLon, check.fromLat);
	const toNearby = await getNearbyStation(check.destLon, check.destLat);

	if (!fromNearby.ok || !toNearby.ok) {
		throw new Response(null, { status: 500 });
	}

	const route = await searchRoute(
		fromNearby.data.name,
		toNearby.data.name,
		context.cloudflare.env,
	);

	if (!route) {
		throw new Response(null, { status: 500 });
	}

	const toFromStation = fromNearby.data.distance;
	const toFromWalkTime = Math.ceil(toFromStation / 80); // 80 m/min walking speed

	const actualDepartureTime = route.departsAt - toFromWalkTime;

	const today = new Date();
	const minutesPassedToday = today.getHours() * 60 + today.getMinutes();

	const timeLeft = actualDepartureTime - minutesPassedToday;

	const status: CheckStatus =
		timeLeft > 15 ? "safe" : timeLeft > 5 ? "advised" : "hurry";

	return {
		status,
		timeLeft,
		route,
		check,
	};
};

export default function CheckPage({ loaderData }: Route.ComponentProps) {
	const fetcher = useFetcher<typeof action>();

	const refresh = useCallback(() => {
		navigator.geolocation.getCurrentPosition((v) => {
			const payload = {
				latitude: v.coords.latitude,
				longitude: v.coords.longitude,
			} satisfies CoordinatePayload;

			fetcher.submit(payload, {
				method: "post",
			});
		});
	}, [fetcher.submit]);

	return (
		<BaseLayout>
			<h1 className="text-4xl/none tracking-tight font-medium">
				Can I get the last trains?
			</h1>

			<div className="space-y-2">
				<p
					className={cn(
						CHECK_TEXT[loaderData.status].statusColor,
						"text-5xl/none tracking-[-2.4px] font-medium",
					)}
				>
					{CHECK_TEXT[loaderData.status].statusText}
				</p>
				<p className="tracking-tight leading-snug">
					{CHECK_TEXT[loaderData.status].description}
				</p>
			</div>

			{loaderData.status === "safe" ? (
				<button type="button" className={buttonStyle()} onClick={refresh}>
					<RefreshCwIcon /> refresh location
				</button>
			) : (
				<ButtonLink
					to={`https://www.google.com/maps/dir/?api=1&origin=${loaderData.check.fromLat},${loaderData.check.fromLon}&destination=${loaderData.check.destLat},${loaderData.check.destLon}&travelmode=transit`}
				>
					<RouteIcon /> open route navigation
				</ButtonLink>
			)}
		</BaseLayout>
	);
}

/**
 * This is just a trigger for an update, returns no meaningful values
 */
export const action = async ({ request, context }: Route.ActionArgs) => {
	const cookie = request.headers.get("Cookie") || "";
	const sessionId = getSessionId(cookie);

	if (!sessionId) {
		return redirect("/setup/destination");
	}

	const formdata = await request.formData();
	const parsed = parseWithZod(formdata, {
		schema: coordinatePayload,
	});

	if (parsed.status !== "success") {
		return {
			success: false,
		};
	}

	await updateCheck(
		context.db,
		sessionId,
		parsed.value.latitude,
		parsed.value.longitude,
	);

	return {
		success: true,
	};
};
