import { addTrainInfo } from "./add-train-info.server";
import { calculateFare } from "./calculate-fare.server";
import { getBestRoute } from "./get-best-route.server";
import { getGraph } from "./get-graph.server";
import { getValidRoutes } from "./get-route.server";
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

	const allPossibleRoutesNoFlat = await Promise.all(
		fromStations.map(
			async (fromStation) =>
				await Promise.all(
					toStations.map(async (toStation) => {
						// Placeholder for graph generation and route finding logic
						const graph = getGraph(fromStation, toStation);
						const routes = getValidRoutes(graph.validPaths);
						const routesWithTrainInfo = await addTrainInfo(routes);
						const bestSorted = getBestRoute(routesWithTrainInfo);
						return bestSorted ? [bestSorted] : [];
					}),
				),
		),
	);
	const allPossibleRoutes = allPossibleRoutesNoFlat.flat(2);

	const bestRoute = getBestRoute(allPossibleRoutes);

	if (!bestRoute) {
		return null;
	}

	const fare = await calculateFare(bestRoute, env);

	const fromRoute = bestRoute?.at(-1);
	const toRoute = bestRoute?.at(0);

	if (!fromRoute || !toRoute) {
		return null;
	}

	return {
		from: fromRoute.fromId,
		departsAt: fromRoute.departsAt,
		to: toRoute.toId,
		arrivesAt: toRoute.arrivesAt,
		fare,
		items: [...bestRoute].reverse(),
	};
};
