import { RouteIcon } from "lucide-react";
import { buttonStyle } from "~/components/button-link";

type RouteNavigationButtonProps = {
	lat: number;
	lon: number;
};

export function RouteNavigationButton({
	lat,
	lon,
}: RouteNavigationButtonProps) {
	const url = new URL("https://www.google.com/maps/dir/");
	url.searchParams.set("api", "1");
	url.searchParams.set("destination", `${lat},${lon}`);
	url.searchParams.set("travelmode", "transit");

	const href = url.toString();

	return (
		<a href={href} className={buttonStyle()} target="_blank" rel="noopener">
			<RouteIcon /> open route navigation
		</a>
	);
}
