import { parseWithZod } from "@conform-to/zod/v4";
import { redirect } from "react-router";
import { BaseLayout } from "~/components/layout";
import { coordinatePayload, getCheck, updateCheck } from "~/features/check";
import { getSessionId } from "~/lib/session.server";
import { PurgeSessionButton } from "./_components/purge-session-button";
import { RefreshLocationButton } from "./_components/refresh-location-button";
import { RouteNavigationButton } from "./_components/route-navigation-button";
import { StatusText } from "./_components/status-text";
import { TwoLastInfo } from "./_components/twolast-info";
import { estimateThird } from "./_lib/estimate-third.server";
import { getStationInfo } from "./_lib/get-station-info.server";
import { getToLocation } from "./_lib/get-to-location.server";
import { useTwoLateStatus } from "./_lib/use-twolate-status";
import type { Route } from "./+types/route";

export const loader = async ({ request, context }: Route.LoaderArgs) => {
	const cookie = request.headers.get("cookie") || "";
	const sessionId = getSessionId(cookie);

	// redirect to setup if no session
	if (!sessionId) {
		return redirect("/setup/destination");
	}

	// get current availability
	const check = await getCheck(context.db, sessionId);

	// * you could fetch Station info using check.stationId
	const station = await getStationInfo(check.stationId);

	return { check, station };
};

export default function CheckPage({
	loaderData: { check, station },
}: Route.ComponentProps) {
	const { status, forceStatus } = useTwoLateStatus(check.leaveTime);

	return (
		<BaseLayout>
			<div className="grid justify-start">
				<button type="button" onClick={() => forceStatus("safe")}>
					Force Safe
				</button>
				<button type="button" onClick={() => forceStatus("advised")}>
					Force Advised
				</button>
				<button type="button" onClick={() => forceStatus("hurry")}>
					Force Hurry
				</button>
			</div>

			<h1 className="text-[2rem]/none tracking-tighter font-medium">
				Can I get the last trains?
			</h1>

			<StatusText status={status} />

			<TwoLastInfo state={status} station={station} check={check} />

			<div className="flex flex-col gap-y-2">
				{status === "safe" ? (
					<RefreshLocationButton />
				) : (
					<RouteNavigationButton lat={check.destLat} lon={check.destLon} />
				)}
				<PurgeSessionButton />
			</div>
		</BaseLayout>
	);
}

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

	const toLocation = await getToLocation(context.db, sessionId);

	const estimated = await estimateThird({
		from: {
			lat: parsed.value.latitude,
			lon: parsed.value.longitude,
		},
		to: {
			lat: toLocation.destLat,
			lon: toLocation.destLon,
		},
	});

	if (!estimated) {
		return new Response("Not Found", { status: 404 });
	}

	await updateCheck(context.db, {
		sessionId,
		stationId: estimated.stationId,
		fare: estimated.fare,
		departureTime: estimated.departureTime,
		leaveTime: estimated.leaveTime,
		fromLat: parsed.value.latitude,
		fromLon: parsed.value.longitude,
		taxiFare: estimated.taxiFare,
	});

	return {
		success: true,
	};
};
