import { parseWithZod } from "@conform-to/zod/v4";
import { data, replace, useFetcher } from "react-router";
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
import { getFcmToken } from "~/features/notify/get-fcm-token";
import { ChangeDestinationButton } from "./_components/change-dest-button";
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

	const fetcher = useFetcher();
	const forceNotification = async () => {
		const token = await getFcmToken();
		fetcher.submit(
			{ token },
			{
				method: "post",
				action: "/force-notification",
			},
		);
	};

	return (
		<BaseLayout>
			<div className="grid justify-start">
				<button type="button" onClick={forceNotification}>
					Force Notification
				</button>
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
