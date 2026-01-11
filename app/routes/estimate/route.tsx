import { parseWithZod } from "@conform-to/zod/v4";
import { data, replace } from "react-router";
import { BaseLayout } from "~/components/layout";
import {
	coordinatePayload,
	getEstimation,
	updateEstimation,
} from "~/features/estimate";
import {
	cancelNotification,
	getFcmTokenCookieHeader,
	getFcmTokenFromCookie,
	registerNotifiaction as registerNotification,
} from "~/features/notify";
import { ChangeDestinationButton } from "./_components/change-dest-button";
import { Devtool } from "./_components/devtool";
import { RefreshLocationButton } from "./_components/refresh-location-button";
import { RouteNavigationButton } from "./_components/route-navigation-button";
import { StatusText } from "./_components/status-text";
import { TwoLastInfo } from "./_components/twolast-info";
import { estimateTwoLate } from "./_lib/estimate-two-late.server";
import { getStationInfo } from "./_lib/get-station-info.server";
import { getDestination } from "./_lib/get-to-location.server";
import { useTwoLateStatus } from "./_lib/use-twolate-status";
import type { Route } from "./+types/route";

export const loader = async ({ request }: Route.LoaderArgs) => {
	const token = getFcmTokenFromCookie(request.headers.get("cookie"));

	if (!token) {
		return replace("/");
	}

	// get current availability
	const check = await getEstimation(token);

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
			<Devtool forceStatus={forceStatus} />

			<StatusText status={status} />

			<TwoLastInfo state={status} station={station} check={check} />

			<div className="flex flex-col gap-y-2">
				{status === "safe" ? (
					<RefreshLocationButton />
				) : (
					<RouteNavigationButton
						latitude={check.destinationLatitude}
						longitude={check.destinationLongitude}
					/>
				)}
				<ChangeDestinationButton />
			</div>
		</BaseLayout>
	);
}

export const action = async ({ request }: Route.ActionArgs) => {
	const formdata = await request.formData();
	const parsed = parseWithZod(formdata, {
		schema: coordinatePayload,
	});

	if (parsed.status !== "success") {
		return {
			success: false,
		};
	}

	const { token, ...origin } = parsed.value;
	const { id, ...destination } = await getDestination(token);

	const estimated = await estimateTwoLate({
		from: origin,
		to: destination,
	});

	if (!estimated) {
		return new Response("Not Found", { status: 404 });
	}

	const estimationId = await updateEstimation({
		...estimated,
		originLatitude: origin.latitude,
		originLongitude: origin.longitude,
		destinationId: id,
	});

	await cancelNotification(token);
	await registerNotification(estimationId, estimated.leaveTime);

	return data(
		{ success: true },
		{
			headers: {
				// refresh FCM token cookie
				"Set-Cookie": getFcmTokenCookieHeader(token),
			},
		},
	);
};
