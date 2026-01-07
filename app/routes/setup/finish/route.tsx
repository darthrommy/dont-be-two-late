import { parseWithZod } from "@conform-to/zod/v4";
import { SearchCheckIcon } from "lucide-react";
import { useCallback, useEffect } from "react";
import { useFetcher, useNavigate } from "react-router";
import { buttonStyle } from "~/components/button-link";
import { BaseLayout } from "~/components/layout";
import { PageDescription, PageTitle } from "~/components/page-text";
import {
	type CoordinatePayload,
	coordinatePayload,
	updateCheck,
} from "~/features/check";
import { getSessionId } from "~/lib/session.server";
import { estimateThird } from "~/routes/check/_lib/estimate-third";
import { getToLocation } from "~/routes/check/_lib/get-to-location";
import type { Route } from "./+types/route";

export default function SetupFinishPage(_: Route.ComponentProps) {
	const fetcher = useFetcher<typeof action>();
	const navigate = useNavigate();

	const submit = useCallback(() => {
		if (fetcher.state === "submitting") return;

		// 渋谷の辺
		const payload = {
			latitude: 35.69310482848679,
			longitude: 139.70175475712858,
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

	useEffect(() => {
		if (fetcher.data?.success) {
			navigate("/check");
		}
	}, [fetcher.data, navigate]);

	return (
		<BaseLayout>
			<PageTitle title={["Great!!!"]} />
			<PageDescription
				description={[
					"You’re all set up to use this app!",
					"But remember,",
					"don’t be two late to get the last train.",
				]}
			/>
			<button className={buttonStyle()} onClick={submit} type="button">
				<SearchCheckIcon /> check if I won't miss it
			</button>
		</BaseLayout>
	);
}

export const action = async ({ request, context }: Route.ActionArgs) => {
	const sessionHeader = request.headers.get("cookie") || "";
	const sessionId = getSessionId(sessionHeader);

	if (!sessionId) {
		throw new Response("Unauthorized", { status: 401 });
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
		return new Response("Not Found", { status: 404 });
	}

	await updateCheck(context.db, {
		sessionId,
		stationId: estimated.stationId,
		fare: estimated.fare,
		departureTime: estimated.departureTime,
		operatorId: estimated.firstOperator,
		fromLat: parsed.value.latitude,
		fromLon: parsed.value.longitude,
		// * you could calculate taxi fare using `getTaxiFare` function
		// * if you want to implement this, call me again :)
		// taxiFare: estimated.taxiFare,
	});

	return {
		success: true,
	};
};
