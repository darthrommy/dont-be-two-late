import { RefreshCwIcon } from "lucide-react";
import { useFetcher } from "react-router";
import { buttonStyle } from "~/components/button-link";
import type { CoordinatePayload } from "~/features/estimate";
import { getFcmToken } from "~/features/notify/get-fcm-token";

const DUMMY: boolean = true;

export const RefreshLocationButton = () => {
	const fetcher = useFetcher();

	const refresh = async () => {
		if (fetcher.state === "submitting") return;

		const token = await getFcmToken();

		if (DUMMY) {
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

	return (
		<button type="button" className={buttonStyle()} onClick={refresh}>
			<RefreshCwIcon /> Refresh location
		</button>
	);
};
