import { extractOperator, IS_OPERATOR_LIMITED } from "~/features/search/utils";
import { odpt } from "~/lib/odpt.server";

export const getStationInfo = async (env: Env, stationId: string) => {
	const client = odpt(env.ODPT_API_KEY);
	const limitedClient = odpt(
		env.ODPT_LIMITED_API_KEY,
		"https://api-challenge.odpt.org/api/v4/",
	);

	const OPERATOR = extractOperator(stationId);
	const fetcher = IS_OPERATOR_LIMITED[OPERATOR] ? limitedClient : client;

	const station = await fetcher.request("OdptStation", {
		"owl:sameAs": stationId,
	});

	if (station.ok) {
		return station.data[0];
	} else {
		throw new Error(`Failed to fetch station info: ${station.error}`);
	}
};
