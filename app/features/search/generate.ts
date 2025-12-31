import "dotenv/config";
// @ts-expect-error: Node.js built-in module
import fs from "node:fs/promises";
import { consola } from "consola";
import type { OdptRailwayType } from "~/lib/odpt/schemas/railway";
import type { OdptStationType } from "~/lib/odpt/schemas/station";
import type { OdptStationTimetableType } from "~/lib/odpt/schemas/station-timetable";
import type { OdptTrainTimetableType } from "~/lib/odpt/schemas/train-timetable";
import { odpt } from "~/lib/odpt.server";
import type {
	Railway,
	Station,
	StationGraph,
	StationTimetable,
	TrainTimetable,
} from "./types";
import {
	convertTime,
	getOperatorId,
	getRailwayId,
	IS_OPERATOR_LIMITED,
	OPERATORS,
	RAILWAYS,
} from "./utils";

// @ts-expect-error: Defined in environment variables
const ODPT_API_KEY = process.env.ODPT_API_KEY as string;
// @ts-expect-error: Defined in environment variables
const ODPT_LIMITED_API_KEY = process.env.ODPT_LIMITED_API_KEY as string;

if (!ODPT_API_KEY) {
	throw new Error("ODPT_API_KEY is not defined in environment variables.");
}

if (!ODPT_LIMITED_API_KEY) {
	throw new Error(
		"ODPT_LIMITED_API_KEY is not defined in environment variables.",
	);
}

const STATION_LIST = [
	"新宿",
	"東新宿",
	"新宿西口",
	"新宿三丁目",
	"渋谷",
	"赤坂見附",
	"銀座",
	"東銀座",
	"本郷三丁目",
	"上野御徒町",
	"上野広小路",
];
const DEST_DIR = "app/features/search/static";

const odptClient = odpt(ODPT_API_KEY);
const odptLimitedClient = odpt(
	ODPT_LIMITED_API_KEY,
	"https://api-challenge.odpt.org/api/v4/",
);

consola.ready("Setup completed.");

// * RAILWAY FETCHING AND PRETTIFYING

const prettifyRailway = (railways: OdptRailwayType[]) => {
	return railways.map((r) => {
		const id = r["owl:sameAs"];
		const title = r["dc:title"];
		const operator = r["odpt:operator"];
		const stations = r["odpt:stationOrder"].map((so) => {
			const id = so["odpt:station"];
			const index = so["odpt:index"];
			return { id, index };
		});
		const ascendingDir = r["odpt:ascendingRailDirection"];
		const descendingDir = r["odpt:descendingRailDirection"];

		if (!ascendingDir || !descendingDir) {
			throw new Error(
				`Railway direction data is missing for railway ID: ${id}`,
			);
		}

		return {
			id,
			title,
			operator,
			stations,
			ascendingDir,
			descendingDir,
		} satisfies Railway;
	});
};

const railways = await Promise.all(
	OPERATORS.map(async (op) => {
		const client = IS_OPERATOR_LIMITED[op] ? odptLimitedClient : odptClient;
		const railways = RAILWAYS[op].map((line) => getRailwayId(op, line));

		const result = await client.request("OdptRailway", {
			"owl:sameAs": railways,
			"odpt:operator": getOperatorId(op),
		});
		if (result.ok) {
			return prettifyRailway(result.data);
		} else {
			consola.error(
				`Error fetching railways for operator ${op}: ${result.error}`,
			);
			return [];
		}
	}),
).then((results) => results.flat());

const railwayDest = `${DEST_DIR}/railways.json`;
await fs.writeFile(railwayDest, JSON.stringify(railways, null, 2), "utf-8");
consola.info(`Railway data has been written to ${railwayDest}.`);

// * STATION FETCHING AND PRETTIFYING

const prettifyStation = (stations: OdptStationType[]) => {
	return stations.map((s) => {
		const id = s["owl:sameAs"];
		const title = s["dc:title"];

		if (!title) {
			throw new Error(`Station title is missing for station ID: ${id}`);
		}

		const railway = s["odpt:railway"];
		const operator = s["odpt:operator"];
		const timetable = s["odpt:stationTimetable"] || [];

		const allRailwayIds = OPERATORS.flatMap((op) => {
			return RAILWAYS[op].map((line) => `${op}.${line}`);
		});

		const connection = (s["odpt:connectingStation"] || []).filter((cs) =>
			allRailwayIds.some((op) => cs.includes(op)),
		);

		return {
			id,
			title,
			operator,
			railway,
			timetable,
			connection,
		} satisfies Station;
	});
};

const stations = await Promise.all(
	OPERATORS.map(async (op) => {
		const client = IS_OPERATOR_LIMITED[op] ? odptLimitedClient : odptClient;
		const railways = RAILWAYS[op].map((line) => getRailwayId(op, line));

		const result = await client.request("OdptStation", {
			"odpt:railway": railways,
			"odpt:operator": getOperatorId(op),
			"dc:title": STATION_LIST,
		});

		if (result.ok) {
			return prettifyStation(result.data);
		} else {
			consola.error(
				`Error fetching stations for operator ${op}: ${result.error}`,
			);
			return [];
		}
	}),
).then((results) => results.flat());

const stationDest = `${DEST_DIR}/stations.json`;
await fs.writeFile(stationDest, JSON.stringify(stations, null, 2), "utf-8");
consola.info(`Station data has been written to ${stationDest}.`);

// * BUILD STATION GRAPH

const stationGraph = stations.reduce((acc, station) => {
	// treat transfer stations as identical nodes
	const identical = station.connection.filter((connId) =>
		stations.some((st) => st.id === connId),
	);

	const railway = railways.find((r) => r.id === station.railway);
	if (!railway) {
		throw new Error(`Railway data not found for station ID: ${station.id}`);
	}

	// get stations on the same railway line
	const lineStations = railway.stations.filter(
		(rst) => stations.some((st) => st.id === rst.id) && rst.id !== station.id,
	);

	// find next and previous stations registered in stations list
	const stationIndex = railway.stations.find(
		(rst) => rst.id === station.id,
	)?.index;

	if (!stationIndex) {
		throw new Error(`Station index not found for station ID: ${station.id}`);
	}

	const outboundNext = lineStations
		.filter((st) => st.index > stationIndex)
		.sort((a, b) => a.index - b.index)
		.at(0);
	const inboundNext = lineStations
		.filter((st) => st.index < stationIndex)
		.sort((a, b) => b.index - a.index)
		.at(0);

	// filter out undefined values and determine directions
	const prev = [outboundNext, inboundNext].flatMap((v) => {
		if (!v) return [];

		const direction =
			v.index > stationIndex ? railway.descendingDir : railway.ascendingDir;

		return { id: v.id, direction };
	});

	const payload = {
		identical,
		prev,
	} satisfies StationGraph[string];

	acc[station.id] = payload;
	return acc;
}, {} as StationGraph);

const stationGraphDest = `${DEST_DIR}/station-graph.json`;
await fs.writeFile(
	stationGraphDest,
	JSON.stringify(stationGraph, null, 2),
	"utf-8",
);
consola.info(`Station graph data has been written to ${stationGraphDest}.`);

// * RETRIEVE STATION TIMETABLE

const prettifyStationTimetable = (
	stationTimetables: OdptStationTimetableType[],
) => {
	return stationTimetables.map((stt) => {
		const station = stt["odpt:station"];

		if (!station) {
			throw new Error(
				`Station ID is missing for station timetable ID: ${station}`,
			);
		}

		const railway = stt["odpt:railway"];
		const operator = stt["odpt:operator"];
		const direction = stt["odpt:railDirection"];

		if (!direction) {
			throw new Error(
				`Rail direction is missing for station timetable ID: ${station}`,
			);
		}

		const calendar = stt["odpt:calendar"];

		if (!calendar) {
			throw new Error(
				`Calendar data is missing for station timetable ID: ${station}`,
			);
		}

		const timetable = (stt["odpt:stationTimetableObject"] || []).flatMap(
			(tto) => {
				const id = tto["odpt:train"];

				if (!id) {
					throw new Error(
						`Train ID is missing in timetable for station timetable ID: ${id}`,
					);
				}

				const $time = tto["odpt:departureTime"];

				if (!$time) {
					throw new Error(
						`Departure time is missing in timetable for station timetable ID: ${id}`,
					);
				}

				const time = convertTime.toMinutes($time);

				// filter out trains departing before 10 PM
				if (time < 21 * 60) return [];

				return { id, time };
			},
		);

		return {
			station,
			railway,
			operator,
			calendar,
			direction,
			timetable,
		} satisfies StationTimetable;
	});
};

const stationTimetables = await Promise.all(
	stations.map(async (station) => {
		const client = IS_OPERATOR_LIMITED[
			station.operator.replace(
				"odpt.Operator:",
				"",
			) as keyof typeof IS_OPERATOR_LIMITED
		]
			? odptLimitedClient
			: odptClient;

		const result = await client.request("OdptStationTimetable", {
			"odpt:station": station.id,
		});

		if (result.ok) {
			return prettifyStationTimetable(result.data);
		} else {
			consola.error(
				`Error fetching timetable for station ${station.id}: ${result.error}`,
			);
			return [];
		}
	}),
).then((results) => results.flat());

const stationTimetableName = `${DEST_DIR}/station-timetables`;

// export weekday and sat/holiday timetables separately
const weekdayTimetables = stationTimetables.filter(
	(stt) => stt.calendar === "odpt.Calendar:Weekday",
);
await fs.writeFile(
	`${stationTimetableName}-weekday.json`,
	JSON.stringify(weekdayTimetables, null, 2),
	"utf-8",
);
consola.info(
	`Weekday station timetable data has been written to ${stationTimetableName}-weekday.json.`,
);

const holidayTimetables = stationTimetables.filter(
	(stt) => stt.calendar === "odpt.Calendar:SaturdayHoliday",
);
await fs.writeFile(
	`${stationTimetableName}-holiday.json`,
	JSON.stringify(holidayTimetables, null, 2),
	"utf-8",
);
consola.info(
	`Saturday/Holiday station timetable data has been written to ${stationTimetableName}-holiday.json.`,
);

// * TRAIN TIMETABLE FETCHING AND PRETTIFYING

const prettifyTrainTimetable = (trainTimetables: OdptTrainTimetableType[]) => {
	return trainTimetables.map((tt) => {
		const id = tt["odpt:train"];

		if (!id) {
			throw new Error(`Train ID is missing for train timetable.`);
		}

		const operator = tt["odpt:operator"];
		const railway = tt["odpt:railway"];
		const calendar = tt["odpt:calendar"];

		if (!calendar) {
			throw new Error(`Calendar data is missing for train timetable ID: ${id}`);
		}

		const timetable = (tt["odpt:trainTimetableObject"] || []).map((tto) => {
			const station =
				tto["odpt:arrivalStation"] || tto["odpt:departureStation"];

			if (!station) {
				throw new Error(
					`Arrival station is missing in timetable for train timetable ID: ${id}`,
				);
			}

			const arrivalTime = tto["odpt:arrivalTime"]
				? convertTime.toMinutes(tto["odpt:arrivalTime"])
				: null;
			const departureTime = tto["odpt:departureTime"]
				? convertTime.toMinutes(tto["odpt:departureTime"])
				: null;

			return {
				station,
				arrivalTime,
				departureTime,
			};
		});

		return {
			id,
			operator,
			railway,
			calendar,
			timetable,
		} satisfies TrainTimetable;
	});
};

const trainTimetables = await Promise.all(
	OPERATORS.map(async (op) => {
		const client = IS_OPERATOR_LIMITED[op] ? odptLimitedClient : odptClient;
		const result = await Promise.all(
			RAILWAYS[op].map(async (r) => {
				const railwayId = getRailwayId(op, r);
				const result = await client.request("OdptTrainTimetable", {
					"odpt:railway": railwayId,
				});

				if (result.ok) {
					// get train IDs from station timetables for the operator
					const trainIds = stationTimetables.flatMap((stt) => {
						const isOpRailway = stt.railway.includes(op);
						if (!isOpRailway) return [];

						return stt.timetable.map((tt) => tt.id);
					});

					// filter train timetables to include only those relevant to the stations we have
					const filteredData = result.data.filter((tt) => {
						const timetableTrainId = tt["odpt:train"];

						if (!timetableTrainId) return false;

						return trainIds.includes(timetableTrainId);
					});
					return prettifyTrainTimetable(filteredData);
				} else {
					consola.error(
						`Error fetching train timetables for operator ${op}: ${result.error}`,
					);
					return [];
				}
			}),
		).then((res) => {
			return res.flat();
		});

		return result;
	}),
).then((results) => results.flat());

// write weekday and sat/holiday train timetables separately
const weekdayTrainTimetables = trainTimetables.filter(
	(tt) => tt.calendar === "odpt.Calendar:Weekday",
);
await fs.writeFile(
	`${DEST_DIR}/train-timetables-weekday.json`,
	JSON.stringify(weekdayTrainTimetables, null, 2),
	"utf-8",
);
consola.info(
	`Weekday train timetable data has been written to ${DEST_DIR}/train-timetables-weekday.json.`,
);

const holidayTrainTimetables = trainTimetables.filter(
	(tt) => tt.calendar === "odpt.Calendar:SaturdayHoliday",
);
await fs.writeFile(
	`${DEST_DIR}/train-timetables-holiday.json`,
	JSON.stringify(holidayTrainTimetables, null, 2),
	"utf-8",
);
consola.info(
	`Saturday/Holiday train timetable data has been written to ${DEST_DIR}/train-timetables-holiday.json.`,
);

consola.success("Generation completed.");
