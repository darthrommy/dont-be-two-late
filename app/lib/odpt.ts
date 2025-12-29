import { z } from "zod/mini";
import type { ODPT_BASE_URL } from "./odpt/const";
import { OdptCalendar } from "./odpt/schemas/calender";
import { OdptOperator } from "./odpt/schemas/operator";
import { OdptPassengerSurvey } from "./odpt/schemas/passenger-survey";
import { OdptRailDirection } from "./odpt/schemas/rail-direction";
import { OdptRailway } from "./odpt/schemas/railway";
import { OdptRailwayFare } from "./odpt/schemas/railway-fare";
import { OdptStation } from "./odpt/schemas/station";
import { OdptStationTimetable } from "./odpt/schemas/station-timetable";
import { OdptTrain } from "./odpt/schemas/train";
import { OdptTrainInformation } from "./odpt/schemas/train-information";
import { OdptTrainTimetable } from "./odpt/schemas/train-timetable";
import { OdptTrainType } from "./odpt/schemas/train-type";

const DATA = {
	OdptOperator,
	OdptCalendar,
	OdptPassengerSurvey,
	OdptRailDirection,
	OdptRailway,
	OdptRailwayFare,
	OdptStation,
	OdptStationTimetable,
	OdptTrain,
	OdptTrainInformation,
	OdptTrainTimetable,
	OdptTrainType,
} as const;
type DataType = typeof DATA;
type DataKeys = keyof DataType;

type ODPTRequestResult<K extends DataKeys> =
	| { ok: true; data: z.infer<DataType[K]["data"]>[]; raw: Response }
	| { ok: false; error: number; raw: Response };

/**
 * Create an ODPT API client
 * @param apiKey ODPT API key
 * @param baseUrl Base URL for ODPT API. This may change depending on `odpt.Operator` you are targeting.
 * @returns ODPT API client
 * @example
 * ```ts
 * const client = odpt("your_api_key");
 * const result = await client.request("OdptStation", { operator: "odpt.Operator:JR-East" });
 * if (result.ok) {
 *   console.log(result.data);
 * } else {
 *   console.error(`Error: ${result.error}`);
 * }
 * ```
 */
export const odpt = (
	apiKey: string,
	/**
	 * @default "https://api.odpt.org/api/v4/"
	 */
	baseUrl: ODPT_BASE_URL = "https://api.odpt.org/api/v4/",
) => {
	const request = async <K extends DataKeys>(
		target: K,
		params?: z.infer<DataType[K]["params"]>,
	): Promise<ODPTRequestResult<K>> => {
		// Validate params before any processing
		const validatedParams = DATA[target].params.parse(params ?? {}) as z.infer<
			DataType[K]["params"]
		>;

		// Construct URL with query parameters
		const url = new URL(target, baseUrl);
		url.searchParams.set("acl:consumerKey", apiKey);

		// Add validated params to URL
		for (const [key, value] of Object.entries(validatedParams)) {
			url.searchParams.set(key, value);
		}

		const response = await fetch(url, { method: "GET" });

		if (response.ok) {
			const responseJson = await response.json();

			const data = z.parse(z.array(DATA[target].data), responseJson);

			return {
				ok: true,
				data: data as z.infer<DataType[K]["data"]>[],
				raw: response,
			};
		} else {
			return {
				ok: false,
				error: response.status,
				raw: response,
			};
		}
	};

	return { request };
};
export type OdptClient = ReturnType<typeof odpt>;
