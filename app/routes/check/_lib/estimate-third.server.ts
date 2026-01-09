import { searchRoute } from "~/features/search";
import { getTaxiFare } from "~/features/taxi-fare/get-taxi-fare.server";
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

const getISODatetimeFromMinutes = (minutesPassed: number) => {
	const JST_OFFSET_HOURS = 9;
	const MS_PER_MINUTE = 60 * 1000;
	const MS_PER_HOUR = 60 * MS_PER_MINUTE;
	const MS_PER_DAY = 24 * MS_PER_HOUR;

	const now = new Date();
	const notUtc = now.getTime();
	const jstOffsetMs = JST_OFFSET_HOURS * MS_PER_HOUR;
	const nowJst = notUtc + jstOffsetMs;

	const jstTodayMidnight = Math.floor(nowJst / MS_PER_DAY) * MS_PER_DAY;
	const currentJstHour = Math.floor((nowJst - jstTodayMidnight) / MS_PER_HOUR);

	const targetMinutes =
		minutesPassed >= 1440 && currentJstHour < 12
			? minutesPassed - 1440
			: minutesPassed;

	const targetTimeShifted = jstTodayMidnight + targetMinutes * MS_PER_MINUTE;
	const targetTimeUtc = targetTimeShifted - jstOffsetMs;

	const isoDate = new Date(targetTimeUtc).toISOString();
	return isoDate;
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
	const leaveTime = route.departsAt - timeToFromStation;

	const taxiFare = await getTaxiFare({
		from,
		to,
		apiKey: env.GOOGLE_MAPS_API_KEY,
	});

	return {
		departureTime: getISODatetimeFromMinutes(route.departsAt),
		leaveTime: getISODatetimeFromMinutes(leaveTime),
		fare: route.fare,
		stationId: route.from,
		stationName: fromNearby.name,
		firstOperator: route.items[0].operator,
		taxiFare,
	};
};
