import { env } from "cloudflare:workers";
import { extractOperator, IS_OPERATOR_LIMITED } from "~/features/search/utils";
import { odpt } from "~/lib/odpt.server";

export const getStationInfo = async (stationId: string) => {
	const client = odpt(env.ODPT_API_KEY);
	const limitedClient = odpt(
		env.ODPT_LIMITED_API_KEY,
		"https://api-challenge.odpt.org/api/v4/",
	);

	const OPERATOR = extractOperator(stationId);
	const fetcher = IS_OPERATOR_LIMITED[OPERATOR] ? limitedClient : client;

	const stationResult = await fetcher.request("OdptStation", {
		"owl:sameAs": stationId,
	});

	if (!stationResult.ok) {
		throw new Error(`Failed to fetch station info: ${stationResult.error}`);
	}

	const station = stationResult.data[0];

	const operatorResult = await fetcher.request("OdptOperator", {
		"owl:sameAs": station["odpt:operator"],
	});

	if (!operatorResult.ok) {
		throw new Error(`Failed to fetch station info: ${operatorResult.error}`);
	}

	const operator = operatorResult.data[0];

	return {
		stationName:
			station["odpt:stationTitle"]?.en ?? station["dc:title"] ?? "N/A",
		operator:
			operator["odpt:operatorTitle"]?.en ??
			operator["odpt:operatorTitle"]?.ja ??
			"N/A",
	};
};
