import { parseWithZod } from "@conform-to/zod/v4";
import { SearchCheckIcon } from "lucide-react";
import { useCallback, useEffect } from "react";
import { useFetcher, useNavigate } from "react-router";
import { buttonStyle } from "~/components/button-link";
import { BaseLayout } from "~/components/layout";
import { PageDescription, PageTitle } from "~/components/page-text";
import { updateCheck } from "~/features/check";
import { getSessionId } from "~/lib/session.server";
import {
	type DestinationPayload,
	destinationPayload,
} from "../destination/_lib/payload.server";
import type { Route } from "./+types/route";

export default function SetupFinishPage(_: Route.ComponentProps) {
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
	const formdata = await request.formData();
	const parsed = parseWithZod(formdata, {
		schema: destinationPayload,
	});

	if (parsed.status !== "success") {
		return {
			success: false,
		};
	}

	const sessionHeader = request.headers.get("Cookie") || "";
	const sessionId = getSessionId(sessionHeader);

	if (!sessionId) {
		return {
			success: false,
		};
	}

	const from = parsed.value;

	await updateCheck(context.db, sessionId, from.latitude, from.longitude);

	return {
		success: true,
	};
};
