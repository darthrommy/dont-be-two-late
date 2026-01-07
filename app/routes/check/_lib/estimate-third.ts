import { searchRoute } from "~/features/search";
import { getNearbyStation } from "~/lib/nearby.server";

type Query = {
	from: {
		lat: number;
		lon: number;
	};
	to: {
		lat: number;
		lon: number;
	};
};

export const estimateThird = async (env: Env, { from, to }: Query) => {
	const fromNearby = await getNearbyStation(from.lon, from.lat);
	const toNearby = await getNearbyStation(to.lon, to.lat);

	const route = await searchRoute(fromNearby.name, toNearby.name, env);

	if (!route) {
		return null;
	}

	const distanceToFromStation = fromNearby.distance;
	const timeToFromStation = Math.ceil(distanceToFromStation / 50); // assuming 50 meters per minute walking speed
	const actualDepartureTime = route.departsAt - timeToFromStation;

	return {
		departureTime: actualDepartureTime,
		fare: route.fare,
		stationId: route.from,
		firstOperator: route.items[0].operator,
	};
};
