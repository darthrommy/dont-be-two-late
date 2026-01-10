import { MapPinHouseIcon } from "lucide-react";
import { useEffect } from "react";
import { useFetcher, useNavigate } from "react-router";
import { buttonStyle } from "~/components/button-link";
import { getFcmToken } from "~/features/notify/get-fcm-token";
import type { action } from "~/routes/cancel-notification/route";

export const ChangeDestinationButton = () => {
	const fetcher = useFetcher<typeof action>();
	const navigate = useNavigate();

	const cancelNotification = async () => {
		if (fetcher.state === "submitting") return;

		const token = await getFcmToken();

		fetcher.submit(
			{ token },
			{
				method: "post",
				action: "/cancel-notification",
			},
		);
	};

	useEffect(() => {
		if (fetcher.data?.success) {
			navigate("/setup/destination", { replace: true });
		}
	}, [fetcher.data, navigate]);

	return (
		<button
			type="button"
			className={buttonStyle(
				"outline bg-transparent text-foreground text-lg [&_svg]:size-5 px-5 py-3",
			)}
			onClick={cancelNotification}
		>
			<MapPinHouseIcon /> change destination
		</button>
	);
};
