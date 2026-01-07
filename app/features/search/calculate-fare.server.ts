import { odpt } from "~/lib/odpt.server";
import type { STATION_KEYS } from "./get-graph.server";
import type { RouteItemWithTime } from "./types";
import { getOperatorId, IS_OPERATOR_LIMITED, type Operator } from "./utils";

/**
 * Calculate total fare for a given route
 * @param route Route segments with train times
 * @param env Environment variables
 * @returns Total fare
 */
export const calculateFare = async (route: RouteItemWithTime[], env: Env) => {
	const odptClient = odpt(env.ODPT_API_KEY);

	let currentFare = 0;
	let currentOperator: Operator | null = null;
	let currentFromId: STATION_KEYS | null = null;
	let currentToId: STATION_KEYS | null = null;

	// read an item and the next one to decide fare calculation
	// so that we can handle operator changes properly
	for (let i = 0; i < route.length; i++) {
		const item = route[i];
		const nextItem = route.at(i + 1);

		if (!currentOperator) {
			currentOperator = item.operator.replaceAll(
				"odpt.Operator:",
				"",
			) as Operator;
			currentFromId = item.fromId as STATION_KEYS;
			currentToId = item.toId as STATION_KEYS;
		}

		if (nextItem && nextItem.operator === currentOperator) {
			// if the operator is the same,
			// API can calculate fare for the entire segment
			// Extend the current segment
			currentToId = nextItem.toId as STATION_KEYS;
		} else {
			// Calculate fare for the current segment
			if (IS_OPERATOR_LIMITED[currentOperator]) {
				// ! Temporary workaround for JR-East fare calculation limitation
				// ! JR-East does not provide fare data for all station pairs via ODPT API.
				currentFare += 170;
			} else {
				const fare = await odptClient.request("OdptRailwayFare", {
					"odpt:fromStation": currentFromId as STATION_KEYS,
					"odpt:toStation": currentToId as STATION_KEYS,
					"odpt:operator": getOperatorId(currentOperator),
				});

				if (!fare.ok) {
					throw new Error(
						`Fare data not found for ${currentOperator} from ${currentFromId} to ${currentToId}`,
					);
				}

				currentFare += fare.data[0]["odpt:ticketFare"];
			}
			// Start a new segment
			currentOperator = nextItem
				? (nextItem.operator.replaceAll("odpt.Operator:", "") as Operator)
				: null;
			if (nextItem) {
				currentFromId = nextItem.fromId as STATION_KEYS;
				currentToId = nextItem.toId as STATION_KEYS;
			}
		}
	}

	return currentFare;
};
