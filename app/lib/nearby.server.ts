import { z } from "zod/mini";

const HEART_RAILS_API_BASE =
	"https://express.heartrails.com/api/json?method=getStations";

const ResponseSchema = z.object({
	response: z.object({
		station: z.array(
			z.object({
				name: z.string(),
				prefecture: z.string(),
				line: z.string(),
				x: z.number().check(z.nonnegative()),
				y: z.number().check(z.nonnegative()),
				postal: z.string().check(z.regex(/^\d{7}$/)),
				distance: z.string().check(z.regex(/^\d+m$/)),
				prev: z.nullable(z.string()),
				next: z.nullable(z.string()),
			}),
		),
	}),
});

/**
 * Get nearby stations based on coordinates.
 * @param x Longtitude coordinate.
 * @param y Latitude coordinate.
 * @returns Nearby stations data or error information.
 * @example
 * ```ts
 * const result = await nearby(139.767125, 35.681236);
 * if (result.ok) {
 *   console.log(result.data);
 * } else {
 *   console.error(`Error: ${result.error}`);
 * }
 * ```
 */
export const getNearbyStation = async (x: number, y: number) => {
	const url = new URL(HEART_RAILS_API_BASE);
	url.searchParams.set("x", x.toString());
	url.searchParams.set("y", y.toString());

	const response = await fetch(url, { method: "GET" });

	const responseJson = await response.json();
	const data = ResponseSchema.parse(responseJson);

	const stations = data.response.station
		.map((s) => ({
			...s,
			distance: parseInt(s.distance.replace("m", ""), 10),
		}))
		.sort((a, b) => a.distance - b.distance);

	const uniqueStation = stations[0];

	return uniqueStation;
};
