import type { STATION_KEYS } from "./get-graph.server";
import STATIONS from "./static/stations.json";

/**
 * Resolve station ID from title
 * @param title Station title
 * @returns Station ID
 */
export const resolveStationIds = (
	/**
	 * @example
	 * "渋谷"
	 */
	title: string,
) => {
	const stations = STATIONS.filter((s) => s.title === title);
	if (stations.length === 0) {
		throw new Error(`Station with title "${title}" not found.`);
	}

	return stations.map((s) => s.id as STATION_KEYS);
};
