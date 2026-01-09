import { z } from "zod/mini";

type GetTaxiFareParams = {
	from: { lat: number; lon: number };
	to: { lat: number; lon: number };
	/**
	 * Google Maps API Key
	 */
	apiKey: string;
};

const MapsAPIResponse = z.object({
	routes: z.array(
		z.object({
			distanceMeters: z.number().check(z.nonnegative()),
			duration: z.string().check(z.regex(/^\d+(\.\d+)?s$/)),
		}),
	),
});

/**
 * Get taxi fare estimate between two locations using Google Maps API
 * @param param0 From and to coordinates along with API key
 * @returns Estimated taxi fare in JPY
 */
export const getTaxiFare = async ({ from, to, apiKey }: GetTaxiFareParams) => {
	const url = `https://routes.googleapis.com/directions/v2:computeRoutes?key=${apiKey}`;
	const body = {
		origin: {
			location: {
				latLng: {
					latitude: from.lat,
					longitude: from.lon,
				},
			},
		},
		destination: {
			location: {
				latLng: {
					latitude: to.lat,
					longitude: to.lon,
				},
			},
		},
		travelMode: "DRIVE",
		routingPreference: "TRAFFIC_AWARE",
		computeAlternativeRoutes: false,
		routeModifiers: {
			avoidTolls: true,
			avoidHighways: true,
			avoidFerries: true,
		},
		units: "METRIC",
	};

	const response = await fetch(url, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			// "X-Goog-Api-Key": apiKey,
			"X-Goog-FieldMask": "routes.duration,routes.distanceMeters",
		},
		body: JSON.stringify(body),
	});

	if (!response.ok) {
		console.error({ status: response.status, statusText: response.statusText });
		console.log(await response.json());
		throw new Error(
			`Maps API request failed with status ${response.status} ${response.statusText}`,
		);
	}

	const data = MapsAPIResponse.parse(await response.json());
	// We only requested one route
	// so it's safe to access the first element
	const trafficRoute = data.routes[0];
	const fare = calculateTaxiFare(trafficRoute.distanceMeters);

	return fare;
};

const calculateTaxiFare = (
	distanceMeters: number,
	midNight: boolean = true,
) => {
	const baseDistance = midNight ? 913 : 1096;
	const baseFare = 500;

	if (distanceMeters <= baseDistance) {
		return baseFare;
	}

	const plusDistanceUnit = midNight ? 213 : 255;
	const plusFareUnit = 100;

	const extraDistance = distanceMeters - baseDistance;
	const extraUnits = Math.ceil(extraDistance / plusDistanceUnit);
	const extraFare = extraUnits * plusFareUnit;

	return baseFare + extraFare;
};
