import { parseWithZod } from "@conform-to/zod/v4";
import { Navigation2Icon } from "lucide-react";
import { useEffect } from "react";
import { data, useFetcher, useNavigate } from "react-router";
import { buttonStyle } from "~/components/button-link";
import { BaseLayout } from "~/components/layout";
import { PageDescription, PageTitle } from "~/components/page-text";
import { coordinatePayload } from "~/features/estimate";
import { getFcmTokenCookieHeader } from "~/features/notify";
import { storeDestination } from "./_lib/store-destination.server";
import { useSubmit } from "./_lib/use-submit";
import type { Route } from "./+types/route";

export default function SetupDestinationPage(_: Route.ComponentProps) {
	const fetcher = useFetcher<typeof action>();
	const submit = useSubmit(fetcher, true);
	const navigate = useNavigate();

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

	await storeDestination(parsed.value);

	return data(
		{ success: true },
		{
			headers: {
				"Set-Cookie": getFcmTokenCookieHeader(parsed.value.token),
			},
		},
	);
};
