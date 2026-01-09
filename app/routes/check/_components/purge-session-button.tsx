import { MapPinHouseIcon } from "lucide-react";
import { useCallback } from "react";
import { useFetcher } from "react-router";
import { buttonStyle } from "~/components/button-link";

export const PurgeSessionButton = () => {
	const fetcher = useFetcher();

	const purgeSession = useCallback(() => {
		if (fetcher.state === "submitting") return;

		fetcher.submit(null, {
			method: "post",
			action: "/purge-session",
		});
	}, [fetcher.state, fetcher.submit]);

	return (
		<button
			type="button"
			className={buttonStyle(
				"outline bg-transparent text-foreground text-lg [&_svg]:size-5 px-5 py-3",
			)}
			onClick={purgeSession}
		>
			<MapPinHouseIcon /> change destination
		</button>
	);
};
