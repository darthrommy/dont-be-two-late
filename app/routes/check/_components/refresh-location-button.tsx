import { RefreshCwIcon } from "lucide-react";
import { useCallback } from "react";
import { useFetcher } from "react-router";
import { buttonStyle } from "~/components/button-link";
import type { CoordinatePayload } from "~/features/check";

export const RefreshLocationButton = () => {
	const fetcher = useFetcher();

	const refresh = useCallback(() => {
		if (fetcher.state === "submitting") return;
		// 渋谷の辺
		const payload = {
			latitude: 35.65595087346799,
			longitude: 139.7011444803657,
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

	return (
		<button type="button" className={buttonStyle()} onClick={refresh}>
			<RefreshCwIcon /> Refresh location
		</button>
	);
};
