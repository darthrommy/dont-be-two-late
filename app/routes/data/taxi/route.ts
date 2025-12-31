import { getTaxiFare } from "~/features/taxi-fare";
import type { Route } from "./+types/route";

export const loader = async ({ context }: Route.LoaderArgs) => {
	return await getTaxiFare({
		apiKey: context.cloudflare.env.GOOGLE_MAPS_API_KEY,
		from: {
			lat: 35.65841253538725,
			lng: 139.70159838817696,
		},
		to: {
			lat: 35.69035355217698,
			lng: 139.7003333782295,
		},
	});
};
