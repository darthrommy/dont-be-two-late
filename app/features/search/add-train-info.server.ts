import TRAIN_TIMETABLES from "./static/train-timetables-weekday.json";
import type { RouteItem, RouteItemWithTime } from "./types";

const getLatestTrain = (
	toId: string,
	fromId: string,
	railway: string,
	deadline: number = 60 * 28,
) => {
	// TRAIN_TIMTABLESから最後の電車を見つけたい
	// まずはrailwayで絞れる
	const candidateTrains = TRAIN_TIMETABLES.filter(
		(tt) => tt.railway === railway,
	);

	// 次はfromId->toIdの電車を探す
	const trainsBetweenStations = candidateTrains.flatMap((tt) => {
		const fromIndex = tt.timetable.findIndex((st) => st.station === fromId);
		const toIndex = tt.timetable.findIndex((st) => st.station === toId);

		// fromIndexかtoIndexが見つからない、もしくはfromIndexがtoIndex以降の場合はスキップ
		if (fromIndex === -1 || toIndex === -1 || fromIndex >= toIndex) {
			return [];
		}

		const fromInfo = tt.timetable[fromIndex];
		const toInfo = tt.timetable[toIndex];

		return {
			id: tt.id,
			// departureTimeはnullになるのは終着駅のみなので
			// ここがnullの時にこの値が参照されることはない
			departsAt: fromInfo.departureTime as number,
			// 終着駅ではarrivalTime, それ以外ではdepartureTimeを代用
			arrivesAt: toInfo.arrivalTime ?? (toInfo.departureTime as number),
		};
	});

	// 最後にdeadline以内の最新の電車を見つける

	const latestTrain = trainsBetweenStations
		.filter((train) => train.arrivesAt <= deadline)
		.sort((a, b) => b.departsAt - a.departsAt)
		.at(0);

	return latestTrain;
};

export const addTrainInfo = (routes: RouteItem[][]) => {
	return routes.map((segment) => {
		const overwrittenSegment: RouteItemWithTime[] = [];

		// get the latest train first
		const toStationRoute = segment[0];
		const realLastTrain = getLatestTrain(
			toStationRoute.toId,
			toStationRoute.fromId,
			toStationRoute.railway,
		);

		if (!realLastTrain) {
			// if no train found, return empty array
			return [];
		}

		for (let i = 0; i < segment.length; i++) {
			const current = segment[i];
			const previous = i > 0 ? overwrittenSegment[i - 1] : null;

			const latestTrain = getLatestTrain(
				current.toId,
				current.fromId,
				current.railway,
				// add a 5-minute buffer for transfer time
				// or 20 mins before the real last train's departure time
				previous ? previous.departsAt - 3 : realLastTrain.arrivesAt - 20,
			);

			if (!latestTrain) {
				// if no train found, skip this segment
				continue;
			}

			overwrittenSegment.push({
				...current,
				departsAt: latestTrain.departsAt,
				arrivesAt: latestTrain.arrivesAt,
			});
		}

		return overwrittenSegment;
	});
};
