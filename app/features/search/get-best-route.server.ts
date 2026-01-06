import type { RouteItemWithTime } from "./types";

/**
 * Get the best route from multiple route options
 * @param routes Route options with train times
 * @returns Best route or null if none found
 */
export const getBestRoute = (routes: RouteItemWithTime[][]) => {
	if (routes.length === 0) {
		return null;
	}

	// * 一番出発時間が遅いやつ、かつ乗り換え回数が少ないやつを選択
	const depratsAtSorted = [...routes]
		.sort((a, b) => {
			const aFirstSegment = a.at(-1);
			const bFirstSegment = b.at(-1);

			if (!aFirstSegment || !bFirstSegment) return 0;

			return bFirstSegment.departsAt - aFirstSegment.departsAt;
		})
		.sort((a, b) => a.length - b.length);

	return depratsAtSorted[0];
};
