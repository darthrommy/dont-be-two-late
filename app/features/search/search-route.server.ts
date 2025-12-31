import { addTrainInfo } from "./add-train-info.server";
import { calculateFare } from "./calculate-fare.server";
import { getBestRoute } from "./get-best-route.server";
import { getGraph } from "./get-graph.server";
import { getRoutes } from "./get-route.server";
import { resolveStationIds } from "./resolve-station-id.server";
import type { RouteObject } from "./types";

/**
 * Search for the best route between two stations
 * @param from start station name
 * @param to destination station name
 * @param env environment variables
 * @returns Best route or null if none found
 */
export const searchRoute = async (
	from: string,
	to: string,
	env: Env,
): Promise<RouteObject | null> => {
	const fromStations = resolveStationIds(from);
	const toStations = resolveStationIds(to);

	const allPossibleRoutes = fromStations.flatMap((fromStation) =>
		toStations.flatMap((toStation) => {
			// Placeholder for graph generation and route finding logic
			const graph = getGraph(fromStation, toStation);
			const routes = getRoutes(graph.validPaths);
			const routesWithTrainInfo = addTrainInfo(routes);
			const bestSorted = getBestRoute(routesWithTrainInfo);
			return bestSorted ? [bestSorted] : [];
		}),
	);

	const bestRoute = getBestRoute(allPossibleRoutes);

	if (!bestRoute) {
		return null;
	}

	const fare = await calculateFare(bestRoute, env);

	const routeFrom = bestRoute?.at(-1)?.fromId;
	const routeTo = bestRoute?.at(0)?.toId;

	if (!routeFrom || !routeTo) {
		return null;
	}

	return {
		from: routeFrom,
		to: routeTo,
		fare,
		items: [...bestRoute].reverse(),
	};
};
