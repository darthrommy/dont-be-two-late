import { parseWithZod } from "@conform-to/zod/v4";
import { Navigation2Icon } from "lucide-react";
import { useCallback, useEffect } from "react";
import { data, useFetcher, useNavigate } from "react-router";
import { buttonStyle } from "~/components/button-link";
import { BaseLayout } from "~/components/layout";
import { PageDescription, PageTitle } from "~/components/page-text";
import { type CoordinatePayload, coordinatePayload } from "~/features/check";
import { createSession } from "~/lib/session.server";
import { storeDestination } from "./_lib/store-destination.server";
import type { Route } from "./+types/route";

export default function SetupDestinationPage(_: Route.ComponentProps) {
	const fetcher = useFetcher<typeof action>();
	const navigate = useNavigate();

	const submit = useCallback(() => {
		if (fetcher.state === "submitting") return;

		// 新宿の辺
		const payload = {
			latitude: 35.69054884039753,
			longitude: 139.70208591032562,
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
			navigate("/setup/finish");
		}
	}, [fetcher.data, navigate]);

	return (
		<BaseLayout>
			<PageTitle title={["Set your", "hotel's", "location"]} />
			<PageDescription
				description={[
					"Where do you spend night?",
					"Set the location when you’re at your hotel.",
				]}
			/>
			<button type="button" className={buttonStyle()} onClick={submit}>
				<Navigation2Icon /> use current location
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
		return new Response("Invalid payload", { status: 400 });
	}

	const sessionId = await storeDestination(parsed.value);

	const cookieHeader = createSession(sessionId);

	return data(
		{ success: true },
		{
			headers: {
				"Set-Cookie": cookieHeader,
			},
		},
	);
};
