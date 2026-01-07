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
import { getSessionId } from "~/lib/session.server";
import { cn } from "~/lib/utils";
import { estimateThird } from "./_lib/estimate-third";
import { getToLocation } from "./_lib/get-to-location";
import {
	type TwoLateStatus,
	useTwoLateStatus,
} from "./_lib/use-twolate-status";
import type { Route } from "./+types/route";

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
	[key in TwoLateStatus]: {
		statusText: string;
		statusColor: string;
		description: string;
	};
};

export const loader = async ({ request, context }: Route.LoaderArgs) => {
	const cookie = request.headers.get("cookie") || "";
	const sessionId = getSessionId(cookie);

	// redirect to setup if no session
	if (!sessionId) {
		return redirect("/setup/destination");
	}

	// get current availability
	const check = await getCheck(context.db, sessionId);

	return check;
};

export default function CheckPage({ loaderData }: Route.ComponentProps) {
	const status = useTwoLateStatus(loaderData.departureTime);

	const fetcher = useFetcher<typeof action>();
	const refresh = useCallback(() => {
		if (fetcher.state === "submitting") return;

		// 渋谷の辺
		const payload = {
			latitude: 35.65595087346799,
			longitude: 139.7011444803657,
		} satisfies CoordinatePayload;

		fetcher.submit(payload, {
			method: "post",
		});

		// navigator.geolocation.getCurrentPosition((v) => {
		// 	const payload = {
		// 		latitude: v.coords.latitude,
		// 		longitude: v.coords.longitude,
		// 	} satisfies CoordinatePayload;

		// 	fetcher.submit(payload, {
		// 		method: "post",
		// 	});
		// });
	}, [fetcher.submit, fetcher.state]);

	return (
		<BaseLayout>
			<h1 className="text-4xl/none tracking-tight font-medium">
				Can I get the last trains?
			</h1>

			<div className="space-y-2">
				<p
					className={cn(
						CHECK_TEXT[status].statusColor,
						"text-5xl/none tracking-[-2.4px] font-medium",
					)}
				>
					{CHECK_TEXT[status].statusText}
				</p>
				<p className="tracking-tight leading-snug">
					{CHECK_TEXT[status].description}
				</p>
			</div>

			{status === "safe" ? (
				<button type="button" className={buttonStyle()} onClick={refresh}>
					<RefreshCwIcon /> refresh location
				</button>
			) : (
				<ButtonLink
					to={`https://www.google.com/maps/dir/?api=1&destination=${loaderData.destLat},${loaderData.destLon}&travelmode=transit`}
				>
					<RouteIcon /> open route navigation
				</ButtonLink>
			)}
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

	const estimated = await estimateThird(context.cloudflare.env, {
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
		return redirect("/404");
	}

	await updateCheck(context.db, {
		sessionId,
		stationId: estimated.stationId,
		fare: estimated.fare,
		departureTime: estimated.departureTime,
		operatorId: estimated.firstOperator,
	});

	return {
		success: true,
	};
};
