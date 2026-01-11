import { parseWithZod } from "@conform-to/zod/v4";
import { SquareCheckIcon } from "lucide-react";
import { data, redirect, replace, useFetcher } from "react-router";
import { z } from "zod/mini";
import { buttonStyle } from "~/components/button-link";
import { BaseLayout } from "~/components/layout";
import { PageDescription, PageTitle } from "~/components/page-text";
import {
	getFcmTokenCookieHeader,
	getFcmTokenFromCookie,
	getNotification,
} from "~/features/notify";
import { getFcmToken } from "~/features/notify/get-fcm-token";
import type { Route } from "./+types/route";

export const loader = async ({ request }: Route.LoaderArgs) => {
	const token = getFcmTokenFromCookie(request.headers.get("cookie"));

	if (token) {
		const notification = await getNotification(token);

		if (notification) {
			return replace("/estimate");
		}
	}
};

export default function SetupWelcomePage(_: Route.ComponentProps) {
	const fetcher = useFetcher<typeof action>();

	const onAddedToHomeScreen = async () => {
		try {
			const token = await getFcmToken();
			fetcher.submit({ token }, { method: "post" });
		} catch (error) {
			console.error("Failed to get FCM token:", error);
		}
	};

	return (
		<BaseLayout>
			<PageTitle title={["Add to your home screen"]} />
			<PageDescription
				description={[
					"Hey, thanks for using this app!",
					"Before getting started, you need add this app to home screen first.",
				]}
			/>
			<button
				type="button"
				className={buttonStyle()}
				onClick={onAddedToHomeScreen}
			>
				<SquareCheckIcon />
				added to home screen!
			</button>
		</BaseLayout>
	);
}

export const action = async ({ request }: Route.ActionArgs) => {
	const formdata = await request.formData();
	const parsed = parseWithZod(formdata, {
		schema: z.object({
			token: z.string(),
		}),
	});

	if (parsed.status !== "success") {
		return data({ success: false }, 400);
	}

	const { token } = parsed.value;
	return redirect("/setup/destination", {
		headers: {
			"Set-Cookie": getFcmTokenCookieHeader(token),
		},
		status: 200,
	});
};
