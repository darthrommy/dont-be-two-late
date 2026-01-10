import { RouteIcon } from "lucide-react";
import { buttonStyle } from "~/components/button-link";

type RouteNavigationButtonProps = {
	latitude: number;
	longitude: number;
};

export function RouteNavigationButton({
	latitude,
	longitude,
}: RouteNavigationButtonProps) {
	const url = new URL("https://www.google.com/maps/dir/");
	url.searchParams.set("api", "1");
	url.searchParams.set("destination", `${latitude},${longitude}`);
	url.searchParams.set("travelmode", "transit");

	const href = url.toString();

	return (
		<a href={href} className={buttonStyle()} target="_blank" rel="noopener">
			<RouteIcon /> open route navigation
		</a>
	);
}
