import { parseWithZod } from "@conform-to/zod/v4";
import { SearchCheckIcon } from "lucide-react";
import { redirect, useFetcher } from "react-router";
import { buttonStyle } from "~/components/button-link";
import { BaseLayout } from "~/components/layout";
import { PageDescription, PageTitle } from "~/components/page-text";
import { coordinatePayload, updateEstimation } from "~/features/estimate";
import {
	cancelNotification,
	getFcmTokenCookieHeader,
	registerNotifiaction,
} from "~/features/notify";
import { estimateTwoLate } from "~/routes/estimate/_lib/estimate-two-late.server";
import { getDestination } from "~/routes/estimate/_lib/get-to-location.server";
import { useSubmit } from "./_lib/use-submit";
import type { Route } from "./+types/route";

export default function SetupFinishPage(_: Route.ComponentProps) {
	const fetcher = useFetcher<typeof action>();
	const submit = useSubmit(fetcher, true);

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
	await registerNotifiaction(estimationId, estimated.leaveTime);

	return redirect("/estimate", {
		headers: { "Set-Cookie": getFcmTokenCookieHeader(token) },
	});
};
