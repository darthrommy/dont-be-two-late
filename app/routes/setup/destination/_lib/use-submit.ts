import type { useFetcher } from "react-router";
import type { CoordinatePayload } from "~/features/estimate";
import { getFcmToken } from "~/features/notify/get-fcm-token";
import type { action } from "../route";

export const useSubmit = (
	fetcher: ReturnType<typeof useFetcher<typeof action>>,
	dummy: boolean = false,
) => {
	const submit = async () => {
		if (fetcher.state === "submitting") return;

		const token = await getFcmToken();

		if (dummy) {
			// 新宿の辺
			const payload = {
				latitude: 35.69054884039753,
				longitude: 139.70208591032562,
				token,
			} satisfies CoordinatePayload;

			fetcher.submit(payload, {
				method: "post",
			});
		} else {
			navigator.geolocation.getCurrentPosition((v) => {
				const payload = {
					latitude: v.coords.latitude,
					longitude: v.coords.longitude,
					token,
				} satisfies CoordinatePayload;

				fetcher.submit(payload, {
					method: "post",
				});
			});
		}
	};

	return submit;
};
