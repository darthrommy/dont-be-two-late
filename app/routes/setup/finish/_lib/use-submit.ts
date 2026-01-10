import type { useFetcher } from "react-router";
import type { CoordinatePayload } from "~/features/estimate";
import { getFcmToken } from "~/features/notify/get-fcm-token";
import type { action } from "../route";

/**
 * Submit hook for setup finish page.
 * @param fetcher The fetcher object from useFetcher.
 * @param dummy Whether to use dummy location (Shibuya) instead of real geolocation.
 * @returns A submit function.
 */
export const useSubmit = (
	fetcher: ReturnType<typeof useFetcher<typeof action>>,
	dummy: boolean = false,
) => {
	const submit = async () => {
		if (fetcher.state === "submitting") return;

		const token = await getFcmToken();

		if (dummy) {
			// 渋谷の辺
			const payload = {
				latitude: 35.65595087346799,
				longitude: 139.7011444803657,
				token,
			} satisfies CoordinatePayload;

			fetcher.submit(payload, {
				method: "post",
			});
		} else {
			// use real geolocation
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
