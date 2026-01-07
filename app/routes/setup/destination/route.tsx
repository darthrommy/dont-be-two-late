import { parseWithZod } from "@conform-to/zod/v4";
import { Navigation2Icon } from "lucide-react";
import { useCallback, useEffect } from "react";
import { data, useFetcher, useNavigate } from "react-router";
import { buttonStyle } from "~/components/button-link";
import { BaseLayout } from "~/components/layout";
import { PageDescription, PageTitle } from "~/components/page-text";
import { createSession } from "~/lib/session.server";
import {
	type DestinationPayload,
	destinationPayload,
} from "./_lib/payload.server";
import { storeDestination } from "./_lib/store-destination.server";
import type { Route } from "./+types/route";

export default function SetupDestinationPage(_: Route.ComponentProps) {
	const fetcher = useFetcher<typeof action>();
	const navigate = useNavigate();

	const submit = useCallback(() => {
		navigator.geolocation.getCurrentPosition((v) => {
			const payload = {
				latitude: v.coords.latitude,
				longitude: v.coords.longitude,
			} satisfies DestinationPayload;
			fetcher.submit(payload, {
				method: "post",
			});
		});
	}, [fetcher.submit]);

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

export const action = async ({ request, context }: Route.ActionArgs) => {
	const formdata = await request.formData();
	const parsed = parseWithZod(formdata, {
		schema: destinationPayload,
	});

	if (parsed.status !== "success") {
		return new Response("Invalid payload", { status: 400 });
	}

	const sessionId = await storeDestination(
		parsed.value,
		context.cloudflare.env,
	);

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
